-module(xprof_tracing_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

%% CT callbacks
-export([all/0,
         groups/0,
         init_per_suite/1,
         end_per_suite/1,
         init_per_group/2,
         end_per_group/2,
         init_per_testcase/2,
         end_per_testcase/2
        ]).

%% Test cases
-export([not_found_error/1,
         already_traced_error/1,
         not_captured_error/1,
         monitor_many_funs/1,
         monitor_recursive_fun/1,
         monitor_keep_recursive_fun/1,
         monitor_crashing_fun/1,
         monitor_ms/1,
         capture_args_res/1,
         capture_args_ms/1,
         capture_exception/1,
         capture_stop/1,
         long_call/1,
         return_matching/1,
         return_matching_query/1,
         return_matching_exception/1,
         spawner_tracing/1,
         all_tracing/1,
         pid_tracing/1,
         dead_proc_tracing/1
        ]).

%% CT funs

all() ->
    [not_found_error,
     already_traced_error,
     not_captured_error,
     monitor_many_funs,
     monitor_recursive_fun,
     monitor_keep_recursive_fun,
     monitor_crashing_fun,
     monitor_ms,
     capture_args_res,
     capture_args_ms,
     capture_exception,
     capture_stop,
     long_call,
     return_matching,
     return_matching_query,
     return_matching_exception,
     {group, simulate_tracing}].

groups() ->
    [{simulate_tracing, [shuffle, {repeat, 2}],
      [spawner_tracing, all_tracing, pid_tracing, dead_proc_tracing]}].

init_per_suite(Config) ->
    {ok, StartedApps} = application:ensure_all_started(xprof_core),
    [{started_apps, StartedApps}|Config].

end_per_suite(Config) ->
    [application:stop(App) || App <- ?config(started_apps,Config)],
    ok.

init_per_group( simulate_tracing, Config) ->
    xprof_core:monitor(MFA = {?MODULE, test_fun, 0}),
    [{mfa, MFA} | Config].

end_per_group( simulate_tracing, Config) ->
    xprof_core:demonitor(?config(mfa, Config)).


init_per_testcase(_, Config) ->
    xprof_core_lib:set_event_handler(self()),
    Config.

end_per_testcase(_, _Config) ->
    xprof_core_lib:unset_event_handler().

%% test cases

all_tracing(Config) ->
    basic_tracing(all, Config).

pid_tracing(Config) ->
    basic_tracing(self(), Config).

basic_tracing(PidSpec, Config) ->
    ok = xprof_core:trace(PidSpec),
    ?assertMatch({PidSpec, running}, xprof_core:get_trace_status()),

    Last = get_print_current_time(),

    test_fun(),
    test_fun(),
    wait_snapshot(1050),
    test_fun(),
    test_fun(),
    wait_snapshot(1050),

    Values = xprof_core:get_data(?config(mfa, Config), Last - 1),

    [Items1,Items2|_] = Values,
    ?assert(0 =< proplists:get_value(count, Items1)),
    ?assert(0 =< proplists:get_value(count, Items2)),

    xprof_core:trace(pause),
    ?assertMatch({PidSpec, paused}, xprof_core:get_trace_status()),
    ok.


spawner_tracing(Config) ->
    ok = xprof_core:trace({spawner, self(), 1.0}),
    ?assertMatch({{spawner, _Pid, 1.0}, running},
                 xprof_core:get_trace_status()),

    Last = get_print_current_time(),

    spawn_test_fun(),
    spawn_test_fun(),
    wait_snapshot(1050),
    spawn_test_fun(),
    spawn_test_fun(),
    wait_snapshot(1050),

    Values = xprof_core:get_data(?config(mfa, Config), Last - 1),

    [Items1, Items2|_] = Values,
    ?assert(0 =< proplists:get_value(count, Items1)),
    ?assert(0 =< proplists:get_value(count, Items2)),

    xprof_core:trace(pause),
    ?assertMatch({{spawner, _Pid, 1.0}, paused},
                 xprof_core:get_trace_status()),
    ok.

dead_proc_tracing(_Config) ->
    {Pid, MRef} = spawn_monitor(fun() -> ok end),
    %% wait for the process to terminate
    receive {'DOWN', MRef, _, _, _} -> ok end,
    ok = xprof_core:trace(Pid),
    ?assertMatch({Pid, running},
                 xprof_core:get_trace_status()),

    ok = xprof_core:trace({spawner, Pid, 1.0}),
    ?assertMatch({{spawner, Pid, 1.0}, running},
                 xprof_core:get_trace_status()),
    ok.

not_found_error(_Config) ->
    MFA = {?MODULE, no_such_fun, 1},
    ?assertEqual(ok, xprof_core:demonitor(MFA)),
    ?assertEqual({error, not_found}, xprof_core:get_data(MFA, 0)),
    ?assertEqual({error, not_found}, xprof_core:capture(MFA, 1, 1)),
    ?assertEqual({error, not_found}, xprof_core:capture_stop(MFA)),
    ?assertEqual({error, not_found}, xprof_core:get_captured_data(MFA, 0)),
    ok.

already_traced_error(_Config) ->
    MFA = {?MODULE, test_fun, 1},
    ok = xprof_core:monitor(MFA),
    try
        ?assertEqual({error, already_traced}, xprof_core:monitor(MFA))
    after
        xprof_core:demonitor(MFA)
    end.

not_captured_error(_Config) ->
    MFA = {?MODULE, test_fun, 1},
    ok = xprof_core:monitor(MFA),
    try
        ?assertEqual({error, not_captured}, xprof_core:capture_stop(MFA)),
        ?assertEqual({ok, {-1,-1,-1,false}, []},
                     xprof_core:get_captured_data(MFA, 0))
    after
        xprof_core:demonitor(MFA)
    end.

monitor_crashing_fun(_Config) ->
    xprof_core:monitor(MFA = {?MODULE, maybe_crash_test_fun, 1}),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    maybe_crash_test_fun(false),
    catch maybe_crash_test_fun(true),
    maybe_crash_test_fun(false),
    wait_snapshot(1010),
    wait_snapshot(1010),

    Items = xprof_core:get_data(MFA, Last - 1),
    %% it is possible that the 3 function calls are spread
    %% across multiple snapshots
    ?assertEqual(3, lists:sum([proplists:get_value(count, Item)
                               || Item <- Items])),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.


monitor_many_funs(_Config) ->
    MFAs = [{code, all_loaded, 0}, {?MODULE, test_fun, 0},
            {?MODULE, spawn_test_fun, 0}, {os, timestamp, 0},
            {erl_scan, string, 0}],

    ?assertEqual([], xprof_core:get_all_monitored()),

    ct:log("Start monitoring 5 funs"),
    [xprof_core:monitor(MFA) || MFA <- MFAs],

    Kids = supervisor:which_children(xprof_core_trace_handler_sup),
    ?assertEqual(5, length(Kids)),

    %% strip formatted queries
    AllMonitored = [MFA || {MFA, _Query} <- xprof_core:get_all_monitored()],
    %% MFAs should be listed in reversed insertion order (last first)
    ?assertEqual(lists:reverse(MFAs), AllMonitored),

    ct:log("Stop monitoring all 5 funs"),
    [xprof_core:demonitor(MFA) || MFA <- MFAs],

    ?assertEqual([], xprof_core:get_all_monitored()),
    ok.

monitor_recursive_fun(_Config) ->
    xprof_core:monitor(MFA = {?MODULE, recursive_test_fun, 1}),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    recursive_test_fun(10),
    ct:sleep(1000),

    %% although the function was called 10 times recursively
    %% only 1 sample is recorded
    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(1, proplists:get_value(count, Items1)),

    %% the duration of the outermost call is at least 100 ms
    ?assert(100 < (proplists:get_value(min, Items1) div 1000)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

monitor_keep_recursive_fun(_Config) ->
    application:set_env(xprof_core, ignore_recursion, false),
    xprof_core:monitor(MFA = {?MODULE, recursive_test_fun, 1}),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    recursive_test_fun(10),
    wait_snapshot(1010),

    %% all 10 samples are recorded
    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(10, proplists:get_value(count, Items1)),

    %% the duration of the innermost call is around 10 ms
    ?assert(20 > (proplists:get_value(min, Items1) div 1000)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    application:unset_env(xprof_core, ignore_recursion),
    ok.

monitor_ms(_Config) ->
    Query = ?MODULE_STRING ++ ":test_fun(T) when T < 5 -> true.",
    MFA = {?MODULE, test_fun, 1},
    xprof_core:monitor(Query),
    ?assertEqual([{MFA, list_to_binary(Query)}], xprof_core:get_all_monitored()),

    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    test_fun(10),
    test_fun(2),
    wait_snapshot(1010),

    %% although the function was called 2 times
    %% only the second call matched the match-spec
    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(1, proplists:get_value(count, Items1)),

    %% only one instance of MF (of any arity) can be monitored at once
    ?assertEqual(
       {error, already_traced},
       xprof_core:monitor(?MODULE_STRING ++ ":test_fun(_) -> true.")),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ?assertEqual([], xprof_core:get_all_monitored()),
    ok.

capture_args_res(_Config) ->
    xprof_core:monitor(MFA = {?MODULE, test_fun, 1}),
    ok = xprof_core:trace(self()),

    %% Start first capture
    {ok, Id} = xprof_core:capture(MFA, 20, 3),

    test_fun(25),
    test_fun(10),
    test_fun(33),

    ct:sleep(10), %% Let trace messages reach the process

    {ok, {Id, 20, 3, true}, [Item1, Item2]} =
        xprof_core:get_captured_data(MFA, 0),

    ?assertMatch({_Num, _Pid, _Time, [25], {return_from, {res, 25}}}, Item1),
    ?assertMatch({_Num, _Pid, _Time, [33], {return_from, {res, 33}}}, Item2),

    test_fun(5),
    test_fun(7),
    test_fun(40),

    ct:sleep(10), %% Let trace messages reach the process

    {ok, {Id, 20, 3, false}, [Item3]} = xprof_core:get_captured_data(MFA, 2),
    ?assertMatch({_Num, _Pid, _Time, [40], {return_from, {res, 40}}}, Item3),

    {ok, {Id, 20, 3, false}, [Item1, Item2, Item3]} =
        xprof_core:get_captured_data(MFA, 0),

    %% Start new capture session
    {ok, Id2} = xprof_core:capture(MFA, 21, 4),

    {ok, {Id2, 21, 4, true}, []} = xprof_core:get_captured_data(MFA, 0),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

capture_args_ms(_Config) ->
    Query = ?MODULE_STRING ++ ":test_fun(T) -> message({time, T}).",
    MFA = {?MODULE, test_fun, 1},
    xprof_core:monitor(Query),
    ok = xprof_core:trace(self()),

    %%?assertEqual({}, sys:get_state(xprof_core_lib:mfa2atom(MFA))),

    %% Start first capture
    {ok, Id} = xprof_core:capture(MFA, 20, 2),

    test_fun(25),
    test_fun(10),
    test_fun(33),
    test_fun(40),

    ct:sleep(10), %% Let trace messages reach the process

    {ok, {Id, 20, 2, false}, [Item1, Item2]} =
        xprof_core:get_captured_data(MFA, 0),

    %% message defined in match-spec in place of args
    ?assertMatch({_Num, _Pid, _Time, {time, 25}, {return_from, {res, 25}}}, Item1),
    ?assertMatch({_Num, _Pid, _Time, {time, 33}, {return_from, {res, 33}}}, Item2),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

capture_exception(_Config) ->
    xprof_core:monitor(MFA = {?MODULE, maybe_crash_test_fun, 1}),
    ok = xprof_core:trace(self()),

    %% Start first capture
    {ok, Id} = xprof_core:capture(MFA, 1, 3),

    catch maybe_crash_test_fun(true),

    ct:sleep(10), %% Let trace messages reach the process

    {ok, {Id, 1, 3, true}, [Item1]} =
        xprof_core:get_captured_data(MFA, 0),

    ?assertMatch({_Num, _Pid, _Time,
                  [true], {exception_from, {throw, test_crash}}}, Item1),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

capture_stop(_Config) ->
    xprof_core:monitor(MFA = {?MODULE, test_fun, 1}),
    ok = xprof_core:trace(self()),

    %% Start first capture
    {ok, Id} = xprof_core:capture(MFA, 20, 5),

    test_fun(25),
    test_fun(10),
    test_fun(33),

    ct:sleep(10), %% Let trace messages reach the process

    {ok, {Id, 20, 5, true}, [Item1, Item2]} =
        xprof_core:get_captured_data(MFA, 0),

    ?assertMatch({_Num, _Pid, _Time, [25], {return_from, {res, 25}}}, Item1),
    ?assertMatch({_Num, _Pid, _Time, [33], {return_from, {res, 33}}}, Item2),

    xprof_core:capture_stop(MFA),

    test_fun(250),
    test_fun(100),

    %% we stopped capturing - so the above calls shouldn't be reported
    %% and HasMore is false
    ?assertEqual({ok, {Id, 20, 5, false}, [Item1, Item2]},
                 xprof_core:get_captured_data(MFA, 0)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

long_call(_Config) ->
    application:set_env(xprof_core, max_duration, 100),

    xprof_core:monitor(MFA = {?MODULE, test_fun, 1}),
    ok = xprof_core:trace(self()),
    {ok, Id} = xprof_core:capture(MFA, 50, 1),

    Last = get_print_current_time(),

    test_fun(20),
    test_fun(200),
    wait_snapshot(1010),

    [StatsItems|_] = xprof_core:get_data(MFA, Last),
    %% both calls should be recorded
    ?assertEqual(2, proplists:get_value(count, StatsItems)),

    %% data capturing also works for too long calls
    {ok, {Id, 50, 1, false}, [CapturedData]} =
        xprof_core:get_captured_data(MFA, 0),
    ?assertMatch({_Num, _Pid, _Time, [200], {return_from, {res, 200}}},
                 CapturedData),

    xprof_core:capture_stop(MFA),
    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),

    application:unset_env(xprof_core, max_duration),

    %% check times as a last thing because they fail sometimes with a big
    %% precision error

    %% minimum should be 20 ms with a bit of precision error
    Min = proplists:get_value(min, StatsItems),
    ?assertMatch({true, _}, {Min < 22*1000, Min}),

    %% maximum should be 100 ms with a bit of precision error
    Max = proplists:get_value(max, StatsItems),
    ?assertMatch({true, _}, {Max > 98*1000, Max}),

    ok.

return_matching(_Config) ->
    xprof_core:monitor(funlatency,
                       [{mfa, MFA = {?MODULE, test_fun, 1}},
                        {retmatch, fun({res, 10}) -> {true, ten};
                                      ({res, 20}) -> true;
                                      ({res, 30}) -> false;
                                      ({res, 40}) -> bad_return
                                   end}]),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    %% matches and changes return value
    test_fun(10),
    %% matches
    test_fun(20),
    %% does not match
    test_fun(30),
    %% bad return - no match
    test_fun(40),
    %% not handled - no match
    test_fun(50),
    wait_snapshot(1010),

    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(2, proplists:get_value(count, Items1)),
    ?assertEqual(5, proplists:get_value(total_count, Items1)),

    %% the duration of the only captured call is at least 20 ms
    %%?assertMatch({20 < (proplists:get_value(min, Items1) div 1000)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

return_matching_query(_Config) ->
    MFA = {?MODULE, test_fun, 1},
    xprof_core:monitor_pp(<<"#funlatency ",
                            "retmatch = {res, 20},"
                            "mfa = xprof_tracing_SUITE:test_fun/1">>),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    test_fun(10),
    test_fun(20),
    wait_snapshot(1010),

    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(1, proplists:get_value(count, Items1)),

    %% the duration of the only captured call is at least 20 ms
    %%?assertMatch({20 < (proplists:get_value(min, Items1) div 1000)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

return_matching_exception(_Config) ->
    xprof_core:monitor(funlatency,
                       [{mfa, MFA = {?MODULE, maybe_crash_test_fun, 1}},
                        {retmatch, fun(throw, test_crash) -> true;
                                      (throw, {test_crash, no_match}) -> false;
                                      (throw, {test_crash, change_ret}) -> {true, err2};
                                      (throw, _) -> bad_return
                                   end}]),
    ok = xprof_core:trace(self()),

    Last = get_print_current_time(),

    %% no match if no exception
    maybe_crash_test_fun(false),
    %% throw:test_crash matches
    catch maybe_crash_test_fun(true),
    %% throw:{test_crash, no_match} does not match
    catch maybe_crash_test_fun(no_match),
    %% throw:{test_crash, change_ret} matches and changes return value
    catch maybe_crash_test_fun(change_ret),
    %% throw:{test_crash, bad_ret} does not match
    catch maybe_crash_test_fun(bad_ret),
    %% error:function_clause does not match
    catch maybe_crash_test_fun(42),

    wait_snapshot(1010),

    [Items1|_] = xprof_core:get_data(MFA, Last),
    ?assertEqual(2, proplists:get_value(count, Items1)),
    ?assertEqual(6, proplists:get_value(total_count, Items1)),

    xprof_core:trace(pause),
    xprof_core:demonitor(MFA),
    ok.

%% Helpers

test_fun() ->
    test_fun(10).

test_fun(Time) ->
    timer:sleep(Time),
    {res, Time}.

spawn_test_fun() ->
    spawn(fun() -> test_fun() end).

recursive_test_fun(1) ->
    timer:sleep(10),
    ok;
recursive_test_fun(N) ->
    timer:sleep(10),
    recursive_test_fun(N - 1).

maybe_crash_test_fun(false) ->
    ok;
maybe_crash_test_fun(true) ->
    timer:sleep(10),
    throw(test_crash);
maybe_crash_test_fun(Reason) when is_atom(Reason) ->
    throw({test_crash, Reason}).

get_print_current_time() ->
    {MS,S,_} = os:timestamp(),
    Last = MS * 1000000 + S,
    ct:pal("Time before test: ~p", [Last]),
    Last.

wait_snapshot(Timeout) ->
    StartT = os:timestamp(),
    receive
        {snapshot, SnaphostT}  ->
            ct:pal("snapshot (~p) took ~p ms ~n",
                   [SnaphostT, timer:now_diff(SnaphostT, StartT)/1000]),
            ok
    after
        Timeout ->
            ct:pal("timeout waiting ~p ms for snapshot", [Timeout]),
            ok
    end.
