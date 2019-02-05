%% -*- erlang-indent-level: 4;indent-tabs-mode: nil -*-
%% ex: ts=4 sw=4 et

%% @doc Gen server that tracks all calls to a particular function. It
%% registers itself localy under a atom that consists of MFA and xprof_
%% prefix. The same name is used to create public ETS table that holds entries
%% with call time stats for every second.
-module(xprof_core_trace_handler).

-behaviour(gen_server).

-export([start_link/4,
         data/2,

         capture/3,
         capture_stop/1,
         get_captured_data/2
        ]).

-export([trace_mfa_off/1]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-record(state, {mfa_spec,
                name,
                last_ts,
                window_size,
                capture_spec,
                capture_id = 0,
                capture_counter = 0,
                cb_mod,
                cb_state}).

-define(ONE_SEC, 1000000). %% Second in microseconds
-define(WINDOW_SIZE, 10*60). %% 10 min window size

%% @doc Starts new process registered localy.
-spec start_link(xprof_core:cmd(), xprof_core:options(), xprof_core:mfa_spec(), module()) -> {ok, pid()}.
start_link(_Cmd, Options, MFASpec, CmdCB) ->
    Name = xprof_core_lib:mfaspec2atom(MFASpec),
    gen_server:start_link({local, Name}, ?MODULE, [Name, Options, MFASpec, CmdCB], []).

%% @doc Returns histogram data for seconds that occured after FromEpoch.
-spec data(xprof_core:mfa_id(), non_neg_integer()) -> [proplists:proplist()] |
                                                 {error, not_found}.
data(MFA, FromEpoch) ->
    Name = xprof_core_lib:mfa2atom(MFA),
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

%% @doc Starts capturing args and results from function calls that lasted longer
%% than specified time threshold.
-spec capture(xprof_core:mfa_id(), non_neg_integer(), non_neg_integer()) ->
                     {ok, non_neg_integer()} | {error, not_found}.
capture(MFA = {M,F,A}, Threshold, Limit) ->
    lager:info("Capturing ~p calls to ~w:~w/~w that exceed ~p ms:",
               [Limit, M, F, A, Threshold]),

    Name = xprof_core_lib:mfa2atom(MFA),
    try
        gen_server:call(Name, {capture, Threshold, Limit})
    catch
        exit:{noproc, _} ->
            {error, not_found}
    end.

-spec capture_stop(xprof_core:mfa_id()) -> ok | {error, not_found | not_captured}.
capture_stop(MFA) ->
    Name = xprof_core_lib:mfa2atom(MFA),
    try
        gen_server:call(Name, capture_stop)
    catch
        exit:{noproc, _} ->
            {error, not_found}
    end.

%% @doc
-spec get_captured_data(xprof_core:mfa_id(), non_neg_integer()) ->
                               {ok,
                                {Index :: non_neg_integer(),
                                 Threshold :: non_neg_integer(),
                                 OrigLimit :: non_neg_integer(),
                                 HasMore :: boolean()
                                }, [tuple()]} |
                               {error, not_found}.
get_captured_data(MFA, Offset) when Offset >= 0 ->
    Name = xprof_core_lib:mfa2atom(MFA),
    try
        [{capture_spec, Index, Threshold, Limit, OrigLimit}] =
            ets:lookup(Name, capture_spec),
        case Index of
            -1 ->
                %% no capturing was done for this MFA yet,
                %% no need to traverse the table
                {ok, {Index, Threshold, OrigLimit, _HasMore = false}, _Items = []};
            _ ->
                MS = [{
                        {{args_res, '$1'},
                         {'$2', '$3','$4','$5'}},
                        [{'>','$1',Offset}],
                        [{{'$1', '$2', '$3', '$4', '$5'}}]
                      }],
                Items = lists:sort(ets:select(Name, MS)),
                HasMore = Offset + length(Items) < Limit,
                {ok, {Index, Threshold, OrigLimit, HasMore}, Items}
        end
    catch error:badarg ->
            {error, not_found}
    end.


%% gen_server callbacks

init([Name, Options, MFASpec, CmdCB]) ->
    {ok, CBState} = CmdCB:init(Options, MFASpec),
    init_storage(Name),
    %% add trace pattern with args capturing turned off
    capture_args_trace_off(MFASpec),
    {ok, #state{mfa_spec = MFASpec,
                name = Name,
                last_ts = os:timestamp(),
                window_size = ?WINDOW_SIZE,
                cb_mod = CmdCB,
                cb_state = CBState
               }, 1000}.

handle_call({capture, Threshold, Limit}, _From,
            State = #state{mfa_spec = MFASpec}) ->
    NewId = State#state.capture_id + 1,
    NewState = State#state{capture_spec = {Threshold, Limit},
                           capture_id = NewId,
                           capture_counter = 1},
    init_new_capture_in_ets(NewState),
    capture_args_trace_on(MFASpec),
    {Timeout, NewState2} = maybe_make_snapshot(NewState),
    {reply, {ok, NewId}, NewState2, Timeout};
handle_call(capture_stop, _From, State = #state{capture_spec = undefined}) ->
    {Timeout, NewState} = maybe_make_snapshot(State),
    {reply, {error, not_captured}, NewState, Timeout};
handle_call(capture_stop, _From, State = #state{mfa_spec = MFASpec}) ->
    capture_args_trace_off(MFASpec),
    #state{capture_spec = {Threshold, Limit},
           name = Name,
           capture_id = Id} = State,
    %% update limit to otherwise has_more will return invalid value
    %% we take ets count to make it idempotent in case 2 instances send stop cmd
    Count = ets:select_count(Name, [{{{args_res, '_'}, '_'}, [], [true]}]),
    NewState = State#state{capture_spec = {Threshold, Count}},
    ets:insert(Name, {capture_spec, Id, Threshold, Count, Limit}),
    {Timeout, NewState2} = maybe_make_snapshot(NewState),
    {reply, ok, NewState2, Timeout};
handle_call(Request, _From, State) ->
    lager:warning("Received unknown message: ~p", [Request]),
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info({trace_ts, _Pid, _Tag, _MFA, _Args, _StartTime} = Msg,
            State = #state{cb_mod = CmdCB,
                           capture_spec = CaptureSpec,
                           capture_counter = Count}) ->
    CaptureThreshold =
        case CaptureSpec of
            {Threshold, Limit} when Limit >= Count ->
                Threshold;
            _ ->
                undefined
        end,
    NewState =
        case CmdCB:handle_event(Msg, CaptureThreshold, State#state.cb_state) of
            ok -> State;
            {ok, NewCBState} ->
                State#state{cb_state = NewCBState};
            {capture, Item} ->
                capture_item(Item, State);
            {capture, Item, NewCBState} ->
                capture_item(Item, State#state{cb_state = NewCBState})
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
    ets:insert(Name, {capture_spec, -1, -1, -1, -1}).

maybe_make_snapshot(State = #state{name=Name, last_ts=LastTS,
                                   window_size=WindSize}) ->
    NowTS = os:timestamp(),
    case timer:now_diff(NowTS, LastTS) of
        DiffMicro when DiffMicro >= ?ONE_SEC ->
            NewState = save_snapshot(NowTS, State),
            remove_outdated_snapshots(Name, xprof_core_lib:now2epoch(NowTS)-WindSize),
	    xprof_core_lib:notify_event_handler({snapshot, NowTS}),
            {calc_next_timeout(DiffMicro), NewState#state{last_ts = NowTS}};
        DiffMicro ->
            {calc_next_timeout(DiffMicro), State}
    end.

calc_next_timeout(DiffMicro) ->
    DiffMilli = DiffMicro div 1000,
    1000 - (DiffMilli rem 1000).

save_snapshot(NowTS, State = #state{name = Name, cb_mod = CmdCB, cb_state = CBState}) ->
    Epoch = xprof_core_lib:now2epoch(NowTS),
    {Snapshot, NewState} =
        case CmdCB:take_snapshot(CBState) of
            {Snapshot0, NewCBState} ->
                {Snapshot0, State#state{cb_state = NewCBState}};
            Snapshot0 ->
                {Snapshot0, State}
        end,
    ets:insert(Name, {{sec, Epoch}, [{time, Epoch}|Snapshot]}),
    NewState.

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
    ets:insert(Name, {capture_spec, Id, Threshold, Limit, Limit}).



capture_item(Item,
             State = #state{mfa_spec = MFASpec,
                            name = Name,
                            capture_spec = {_Threshold, Limit},
                            capture_counter = Count}) ->
    ets:insert(Name, {{args_res, Count}, Item}),
    %% reached limit - turn off args tracing
    Count =:= Limit andalso
        capture_args_trace_off(MFASpec),
    State#state{capture_counter = Count + 1}.

-spec capture_args_trace_on(xprof_core:mfa_spec()) -> any().
capture_args_trace_on({MFAId, {_MSOff, MSOn}}) ->
    erlang:trace_pattern(MFAId, MSOn, [local]).

-spec capture_args_trace_off(xprof_core:mfa_spec()) -> any().
capture_args_trace_off({MFAId, {MSOff, _MSOn}}) ->
    erlang:trace_pattern(MFAId, MSOff, [local]).

-spec trace_mfa_off(xprof_core:mfa_id()) -> any().
trace_mfa_off({M, F, '_'}) ->
    %% FIXME: this will turn off tracing also
    %% for the same function with a given arity
    erlang:trace_pattern({M, F, '_'}, false, [local]);
trace_mfa_off(MFA) ->
    erlang:trace_pattern(MFA, false, [local]).

