-module(xprof_tracing_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

-compile(export_all).

all() -> 
    [{group, all}].

groups() ->
    [{all, [shuffle, {repeat, 2}], [spawner_tracing, all_tracing, pid_tracing]}].
     
		

init_per_suite(Config) ->
    {ok, _} = xprof:start(),
    xprof_tracer:monitor(MFA = {?MODULE, test_run, 0}),
    [{mfa, MFA} | Config].

end_per_suite(Config) ->
    xprof_tracer:demonitor(?config(mfa, Config)),
    xprof:stop(),
    ok.

%% test cases

all_tracing(Config) ->
    basic_tracing(all, Config).

pid_tracing(Config) ->
    basic_tracing(self(), Config).

basic_tracing(PidSpec, Config) ->
    ok = xprof_tracer:trace(PidSpec),    

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

    xprof_tracer:trace(pause).


spawner_tracing(Config) ->
    ok = xprof_tracer:trace({spawner, self(), 1.0}),    

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

    xprof_tracer:trace(pause).

%% Helpers

test_run() ->
    ct:sleep(random:uniform(10)).


spawn_test_run() ->
    spawn(fun() -> test_run() end).
