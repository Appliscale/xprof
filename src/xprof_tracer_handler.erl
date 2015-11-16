%% -*- erlang-indent-level: 4;indent-tabs-mode: nil -*-
%% ex: ts=4 sw=4 et

%% @doc Gen server that that tracks all calls to particular function. It
%% registers it localy under a atom that consists of MFA and xprof_monitor
%% prefix. The same name is used to create public ETS table that holds etries
%% with call time stats for evey second.
-module(xprof_tracer_handler).

-behaviour(gen_server).

-export([start_link/1, data/2, capture/3, get_captured_data/2]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-record(state, {mfa, name, last_ts, hdr_ref, window_size,
                capture_spec, capture_id=0, capture_counter=0}).

-define(ONE_SEC, 1000000). %% Second in microseconds
-define(WINDOW_SIZE, 10*60). %% 10 min window size

%% @doc Starts new process registered localy.
-spec start_link(mfa()) -> {ok, pid()}.
start_link(MFA) ->
    Name = xprof_lib:mfa2atom(MFA),
    gen_server:start_link({local, Name}, ?MODULE, [MFA, Name], []).

%% @doc Returns histogram data for seconds that occured after FromEpoch.
-spec data(mfa(), non_neg_integer()) -> [proplists:proplist()] |
                                        {error, not_found}.
data(MFA, FromEpoch) ->
    Name = xprof_lib:mfa2atom(MFA),
    try
        ets:select(Name, [{
                            {{sec, '$1'},'$2'},
                            [{'>','$1',FromEpoch}],
                            ['$2']
                          }])
    catch
        error:badarg ->
            {error, not_found}
    end.

%% @doc Starts capturing args and results from function calls that lasted long
%% than specified time threshold.
-spec capture(mfa(), non_neg_integer(), non_neg_integer()) ->
                     {ok, non_neg_integer()}.
capture(MFA = {M,F,A}, Threshold, Limit) ->
    lager:info("Capturing ~p calls to ~w:~w/~b that exceed ~p ms:",
               [Limit, M, F, A, Threshold]),

    Name = xprof_lib:mfa2atom(MFA),
    gen_server:call(Name, {capture, Threshold, Limit}).

%% @doc
-spec get_captured_data(mfa(), non_neg_integer()) ->
                               empty | {ok,
                                        {Id :: non_neg_integer(),
                                         Threshold :: non_neg_integer(),
                                         Limit :: non_neg_integer()},
                                        list(any())}.
get_captured_data(MFA, Offset) ->
    Name = xprof_lib:mfa2atom(MFA),
    Items = lists:sort(ets:select(Name,
                                  [{
                                     {{args_res, '$1'},
                                      {'$2', '$3','$4','$5'}},
                                     [{'>','$1',Offset}],
                                     [['$1', '$2', '$3', '$4', '$5']]
                                   }])),

    [{capture_spec, Id, Threshold, Limit}] = ets:lookup(Name, capture_spec),
    {ok, {Id, Threshold, Limit}, Items}.


%% gen_server callbacks

init([MFA, Name]) ->
    {ok, HDR} = init_storage(Name),
    {ok, #state{mfa=MFA, hdr_ref=HDR, name=Name,
                last_ts=os:timestamp(),
                window_size=?WINDOW_SIZE}, 1000}.

handle_call({capture, Threshold, Limit}, _From,
            State = #state{}) ->
    NewId = State#state.capture_id + 1,
    NewState = State#state{capture_spec = {Threshold, Limit},
                           capture_id = NewId,
                           capture_counter = 1},
    init_new_capture_in_ets(NewState),
    {reply, {ok, NewId}, NewState};
handle_call(Request, _From, State) ->
    lager:warning("Received unknown message: ~p", [Request]),
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info({trace_ts, Pid, call, {_M, _F, Args}, StartTime}, State) ->
    put_ts_args(Pid, StartTime, Args),

    {Timeout, NewState} = maybe_make_snapshot(State),
    {noreply, NewState, Timeout};
handle_info({trace_ts, Pid, return_from, _MFA, Ret, EndTime}, State) ->

    NewState = case get_ts_args(Pid) of
                   undefined ->
                       State;
                   {StartTime, Args} ->
                       CallTime = timer:now_diff(EndTime, StartTime),
                       record_results(Pid, CallTime, Args, Ret, State)
               end,

    {Timeout, NewState2} = maybe_make_snapshot(NewState),
    {noreply, NewState2, Timeout};
handle_info(timeout, State) ->
    {Timeout, NewState} = maybe_make_snapshot(State),
    {noreply, NewState, Timeout};
handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% Internal functions

init_storage(Name) ->
    ets:new(Name, [public, named_table]),
    ets:insert(Name, {capture_spec, -1, -1, -1}),
    hdr_histogram:open(1000000,3).

maybe_make_snapshot(State = #state{name=Name, last_ts=LastTS,
                                   window_size=WindSize}) ->
    NowTS = os:timestamp(),
    case timer:now_diff(NowTS, LastTS) of
        DiffMicro when DiffMicro >= ?ONE_SEC ->
            save_snapshot(NowTS, State),
            remove_outdated_snapshots(Name, xprof_lib:now2epoch(NowTS)-WindSize),
            {calc_next_timeout(DiffMicro), State#state{last_ts=NowTS}};
        DiffMicro ->
            {calc_next_timeout(DiffMicro), State}
    end.

calc_next_timeout(DiffMicro) ->
    DiffMilli = DiffMicro div 1000,
    1000 - DiffMilli rem 1000.

save_snapshot(NowTS, #state{name=Name, hdr_ref=Ref}) ->
    Epoch = xprof_lib:now2epoch(NowTS),
    ets:insert(Name, [{{sec, Epoch}, get_current_hist_stats(Ref, Epoch)}]),
    hdr_histogram:reset(Ref).

get_current_hist_stats(HistRef, Time) ->
    [{time, Time},
     {min,      hdr_histogram:min(HistRef)},
     {mean,     hdr_histogram:mean(HistRef)},
     {median,   hdr_histogram:median(HistRef)},
     {max,      hdr_histogram:max(HistRef)},
     {stddev,   hdr_histogram:stddev(HistRef)},
     {p25,      hdr_histogram:percentile(HistRef,25.0)},
     {p50,      hdr_histogram:percentile(HistRef,50.0)},
     {p75,      hdr_histogram:percentile(HistRef,75.0)},
     {p90,      hdr_histogram:percentile(HistRef,90.0)},
     {p99,      hdr_histogram:percentile(HistRef,99.0)},
     {p9999999, hdr_histogram:percentile(HistRef,99.9999)},
     {memsize,  hdr_histogram:get_memory_size(HistRef)},
     {count,    hdr_histogram:get_total_count(HistRef)}].

remove_outdated_snapshots(Name, TS) ->
    ets:select_delete(Name,
                      [{
                         {{sec, '$1'},'_'},
                         [{'<','$1',TS}],
                         [true]
                       }]).

init_new_capture_in_ets(State) ->
    #state{name=Name, capture_id=Id,
           capture_spec={Threshold, Limit}} = State,

    ets:select_delete(Name,
                      [{
                         {{args_res, '_'},'_'},
                         [],
                         [true]
                       }]),
    ets:insert(Name, {capture_spec, Id, Threshold, Limit}).

%% @doc Count the depth of recursion in this process
put_ts_args(Pid, StartTime, Args) ->
    case get({Pid, call_count}) of
        undefined ->
            put({Pid, args}, Args),
            put({Pid, ts}, StartTime),
            put({Pid, call_count}, 1);
        CC ->
            put({Pid, call_count}, CC + 1)
    end.

%% @doc Only return start time of the outermost call
get_ts_args(Pid) ->
    case get({Pid, call_count}) of
        undefined ->
            %% we missed the call of this function
            undefined;
        1 ->
            erase({Pid, call_count}),
            StartTime = erase({Pid, ts}),
            {StartTime, erase({Pid, args})};
        CC when CC > 1 ->
            put({Pid, call_count}, CC - 1),
            undefined
    end.

record_results(Pid, CallTime, Args, Res,
               State = #state{name = Name,
                              hdr_ref = Ref,
                              capture_spec = CaptureSpec,
                              capture_counter = Count}) ->

    hdr_histogram:record(Ref, CallTime),

    case {CaptureSpec, CallTime} of
        {{Threshold, Limit}, CallTime}
          when CallTime > Threshold * 1000 andalso Count =< Limit ->
            ets:insert(Name, {{args_res, Count},
                              {Pid, CallTime, Args, Res}}),
            State#state{capture_counter = Count + 1};
        _ ->
            State
    end.
