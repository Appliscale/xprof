%% -*- erlang-indent-level: 4;indent-tabs-mode: nil -*-
%% ex: ts=4 sw=4 et

%% @doc Gen server that that tracks all calls to particular function. It
%% registers it localy under a atom that consists of MFA and xprof_monitor
%% prefix. The same name is used to create public ETS table that holds etries
%% with call time stats for evey second.
-module(xprof_tracer_handler).

-behaviour(gen_server).

-export([start_link/1, data/2 ]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-record(state, {mfa, name, last_ts, hdr_ref, window_size}).

-define(ONE_SEC, 1000000). %% Second in microseconds
-define(WINDOW_SIZE, 10*60). %% 10 min window size

%% @doc Starts new process registered localy.
-spec start_link(mfa()) -> {ok, pid()}.
start_link(MFA) ->
    Name = xprof_lib:mfa2atom(MFA),
    gen_server:start_link({local, Name}, ?MODULE, [MFA, Name], []).

%% @doc Returns histogram data for seconds that occured after FromEpoch.
-spec data(mfa(), non_neg_integer()) -> [proplists:proplist()].
data(MFA, FromEpoch) ->
    Name = xprof_lib:mfa2atom(MFA),
    try
        ets:select(Name, [{ {{sec, '$1'},'$2'},[{'>','$1',FromEpoch}],['$2']}])
    catch
        error:badarg ->
            {error, not_found}
    end.

%% gen_server callbacks

init([MFA, Name]) ->
    {ok, HDR} = init_storage(Name),
    {ok, #state{mfa=MFA, hdr_ref=HDR, name=Name, last_ts=os:timestamp(),
                window_size=?WINDOW_SIZE}, 1000}.

handle_call(Request, _From, State) ->
    lager:warn("Received unknown message: ~p", [Request]),
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info({trace_ts, Pid, call, _, StartTime}, State) ->
    put({Pid, ts}, StartTime),

    {Timeout, NewState} = maybe_make_snapshot(State),
    {noreply, NewState, Timeout};
handle_info({trace_ts, Pid, return_from, _, _, EndTime},
            State = #state{hdr_ref=Ref}) ->
    StartTime = erase({Pid, ts}),

    CallTime = timer:now_diff(EndTime,StartTime),
    hdr_histogram:record(Ref, CallTime),

    {Timeout, NewState} = maybe_make_snapshot(State),
    {noreply, NewState, Timeout};
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
    ets:select_delete(Name, [{ {{sec, '$1'},'_'},[{'<','$1',TS}],[true]}]).
