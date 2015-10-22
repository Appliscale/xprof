-module(xprof_tracing_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

-compile(export_all).

%% CT funs

all() ->
    [monitor_many_funs,
     monitor_recursive_fun,
     {group, simulate_tracing}].

groups() ->
    [{simulate_tracing, [shuffle, {repeat, 2}],
      [spawner_tracing, all_tracing, pid_tracing]}].


init_per_suite(Config) ->
    {ok, _} = xprof:start(),
    Config.

end_per_suite(_Config) ->
    xprof:stop(),
    ok.

init_per_group( simulate_tracing, Config) ->
    xprof_tracer:monitor(MFA = {?MODULE, test_run, 0}),
    [{mfa, MFA} | Config].

end_per_group( simulate_tracing, Config) ->
    xprof_tracer:demonitor(?config(mfa, Config)).

%% test cases

all_tracing(Config) ->
    basic_tracing(all, Config).

pid_tracing(Config) ->
    basic_tracing(self(), Config).

basic_tracing(PidSpec, Config) ->
    ok = xprof_tracer:trace(PidSpec),
    ?assertMatch({PidSpec, false, false}, xprof_tracer:trace_status()),

    {MS,S,_} = os:timestamp(),
    Last = MS * 1000000 + S,
    ct:pal("Time before test: ~p", [Last]),

    test_run(),
    test_run(),
    ct:sleep(1000),
    test_run(),
    test_run(),
    ct:sleep(2000),

    Values = xprof_tracer:data(?config(mfa, Config), Last),

    [Items1,Items2|_] = Values,
    ?assert(0 =< proplists:get_value(count, Items1)),
    ?assert(0 =< proplists:get_value(count, Items2)),

    xprof_tracer:trace(pause),
    ?assertMatch({PidSpec, true, false}, xprof_tracer:trace_status()).


spawner_tracing(Config) ->
    ok = xprof_tracer:trace({spawner, self(), 1.0}),
    ?assertMatch({{spawner, _Pid, 1.0}, false, false},
                 xprof_tracer:trace_status()),

    {MS,S,_} = os:timestamp(),
    Last = MS*1000000 + S,
    ct:pal("Time before test: ~p", [Last]),

    spawn_test_run(),
    spawn_test_run(),
    ct:sleep(1000),
    spawn_test_run(),
    spawn_test_run(),
    ct:sleep(2000),

    Values = xprof_tracer:data(?config(mfa, Config), Last),

    [Items1, Items2|_] = Values,
    ?assert(0 =< proplists:get_value(count, Items1)),
    ?assert(0 =< proplists:get_value(count, Items2)),

    xprof_tracer:trace(pause),
    ?assertMatch({{spawner, _Pid, 1.0}, true, false},
                 xprof_tracer:trace_status()).


monitor_many_funs(_Config) ->
    MFAs = [{code, all_loaded, 0}, {?MODULE, test_run, 0},
            {?MODULE, spawn_test_run, 0}, {os, timestamp, 0},
            {erl_scan, string, 0}],

    ?assertEqual([], xprof_tracer:all_monitored()),

    ct:log("Start monitoring 5 funs"),
    [xprof_tracer:monitor(MFA) || MFA <- MFAs],

    Kids = supervisor:which_children(xprof_tracer_handler_sup),
    ?assertEqual(5, length(Kids)),

    ?assertEqual(MFAs, xprof_tracer:all_monitored()),

    ct:log("Stop monitoring all 5 funs"),
    [xprof_tracer:demonitor(MFA) || MFA <- MFAs],

    ?assertEqual([], xprof_tracer:all_monitored()).

monitor_recursive_fun(_Config) ->
    xprof_tracer:monitor(MFA = {?MODULE, recursive_test_run, 1}),
    ok = xprof_tracer:trace(self()),

    {MS,S,_} = os:timestamp(),
    Last = MS*1000000 + S,
    ct:pal("Time before test: ~p", [Last]),

    recursive_test_run(10),
    ct:sleep(1000),

    %% although the function was called 10 times recursively
    %% only 1 sample is recorded
    [Items1|_] = xprof_tracer:data(MFA, Last),
    ?assertEqual(1, proplists:get_value(count, Items1)),
    %% the duration of the outermost call is at least 100 ms
    ?assert(100 < (proplists:get_value(min, Items1) div 1000)),

    xprof_tracer:trace(pause),
    xprof_tracer:demonitor(MFA),
    ok.


%% Helpers

test_run() ->
    ct:sleep(random:uniform(10)).


spawn_test_run() ->
    spawn(fun() -> test_run() end).


recursive_test_run(1) ->
    ok;
recursive_test_run(N) ->
    ct:sleep(10),
    recursive_test_run(N - 1).
