-module(xprof_tracer).

-include("xprof.hrl").

-export([start/0, stop/0,
         monitor_fun/1, demonitor_fun/1,
         pull_data/1, print_stats/1]).

-spec start() -> ok.
%% @doc Starts DBG tracer for all processes in the VM.
start() ->
    dbg:tracer(process, {fun process_trace/2, dict:new()}),
    {ok, _} = dbg:p(all, [c]),
    ok.

%% @doc Stops dbg and clears all trace patterns.
%% @see dbg:stop_clear/0
-spec stop() -> ok.
stop() ->
    dbg:stop_clear().

%% @doc Starts monitoring for particular function call.
-spec monitor_fun(mfa()) -> true.
monitor_fun(MFA) ->
    {ok, Ref} = hdr_histogram:open(1000000,3),

    xprof_hist_db:put(MFA, Ref),

    dbg:tpl(MFA, x),
    true.

-spec demonitor_fun(mfa()) -> boolean().
demonitor_fun(MFA) ->
    case xprof_hist_db:exists(MFA) of
        true ->
            Ref = xprof_hist_db:get(MFA),
            hdr_histogram:close(Ref),

            dbg:ctp(MFA),

            xprof_hist_db:erase(MFA),
            true;
        false ->
            false
    end.

-spec pull_data(mfa()) -> proplists:proplist().
pull_data(MFA) ->
    HistRef = xprof_hist_db:get(MFA),
    Vals = get_hdr_items(HistRef),
    hdr_histogram:reset(HistRef),
    Vals.

get_hdr_items(HistRef) ->
    {MS, S,_} = os:timestamp(),
    Time = MS * 1000000 + S,
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

print_stats(MFA) ->
    HistRef = xprof_hist_db:get(MFA),
    io:format("Min ~p~n",         [hdr_histogram:min(HistRef)]),
    io:format("Mean ~.3f~n",      [hdr_histogram:mean(HistRef)]),
    io:format("Median ~.3f~n",    [hdr_histogram:median(HistRef)]),
    io:format("Max ~p~n",         [hdr_histogram:max(HistRef)]),
    io:format("Stddev ~.3f~n",    [hdr_histogram:stddev(HistRef)]),
    io:format("99ile ~.3f~n",     [hdr_histogram:percentile(HistRef,99.0)]),
    io:format("99.9999ile ~.3f~n",[hdr_histogram:percentile(HistRef,99.9999)]),
    io:format("Memory Size ~p~n", [hdr_histogram:get_memory_size(HistRef)]),
    io:format("Total Count ~p~n", [hdr_histogram:get_total_count(HistRef)]).


%% Tracer callbacks

process_trace({trace, Pid, call, MFArgs}, Dict) ->
    Key = key(Pid,MFArgs),
    dict:store(Key, os:timestamp(), Dict);
process_trace({trace, Pid, return_from, MFA, _},Dict) ->
    Key = key(Pid, MFA),
    EndTime = os:timestamp(),
    StartTime = dict:fetch(Key, Dict),
    Time = timer:now_diff(EndTime, StartTime),
    HistRef = xprof_hist_db:get(MFA),
    hdr_histogram:record(HistRef, Time),

    dict:erase(Key, Dict);
process_trace(Msg, _) ->
    lager:error("Received unexpected trace message: ~p~n",[Msg]).

%% Helpers

key(Pid, {M,F,A}) when is_list(A) ->
    key(Pid, {M,F,length(A)});
key(Pid, {M,F,A}) ->
    {Pid,{M,F,A}}.
