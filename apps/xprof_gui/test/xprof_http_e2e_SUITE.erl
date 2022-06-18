-module(xprof_http_e2e_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

-define(TEST_PORT, 7891).

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
-export([get_initialized_trace_status_on_start/1,
         get_running_status_after_setting_tracing/1,
         trace_set_only_accepts_all_and_pause/1,
         try_to_start_monitoring_invalid_query/1,
         monitor_valid_query/1,
         monitor_valid_query_twice/1,
         monitor_query_with_matchspec/1,
         get_overflow_status_after_hitting_overload/1,
         get_function_proposals_for_known_module/1,
         no_function_proposals_for_invalid_module/1,
         stop_monitoring/1,
         get_data_for_not_traced_fun/1,
         get_data_for_traced_fun/1,
         error_when_starting_not_traced_fun/1,
         no_capture_data_when_not_traced/1,
         capture_data_when_traced_test/1,
         capture_data_with_formatted_exception_test/1,
         capture_data_with_large_result/1,
         error_when_stopping_not_traced_fun/1,
         error_when_stopping_not_started_capture/1,
         dont_receive_new_capture_data_after_stop/1,
         in_this_project_we_should_detect_erlang/1,
         but_it_should_return_elixir_if_it_is_forced_as_setting/1,
         explore_callees_of_standard_function/1,
         explore_callees_on_not_existing_function/1,
         explore_callees_in_elixir_mode/1,
         core_not_running/1
        ]).

%% CT funs

all() ->
    [
     {group, erlang},
     {group, elixir}
    ].

groups() ->
    [
     {erlang,
      [],
      [
       get_initialized_trace_status_on_start,
       get_running_status_after_setting_tracing,
       trace_set_only_accepts_all_and_pause,
       try_to_start_monitoring_invalid_query,
       monitor_valid_query,
       monitor_valid_query_twice,
       monitor_query_with_matchspec,
       get_overflow_status_after_hitting_overload,
       get_function_proposals_for_known_module,
       no_function_proposals_for_invalid_module,
       stop_monitoring,
       get_data_for_not_traced_fun,
       get_data_for_traced_fun,
       error_when_starting_not_traced_fun,
       no_capture_data_when_not_traced,
       capture_data_when_traced_test,
       capture_data_with_formatted_exception_test,
       capture_data_with_large_result,
       error_when_stopping_not_traced_fun,
       error_when_stopping_not_started_capture,
       dont_receive_new_capture_data_after_stop,
       in_this_project_we_should_detect_erlang,
       but_it_should_return_elixir_if_it_is_forced_as_setting,
       explore_callees_of_standard_function,
       explore_callees_on_not_existing_function,
       core_not_running
      ]},
     {elixir,
      [],
      [explore_callees_in_elixir_mode]}
    ].

init_per_suite(Config) ->
    inets:start(),
    Config.

end_per_suite(_Config) ->
    ok.

init_per_group(elixir, Config) ->
    case xprof_core_test_lib:ensure_elixir_setup_for_e2e_test() of
        [] ->
            {skip, "Elixir unsupported on this OTP release."};
        {setup, SetupFun, CleanupFun} ->
            SetupFun(),
            [{cleanup, CleanupFun} | Config]
    end;
init_per_group(_, Config) ->
    Config.

end_per_group(elixir, Config) ->
    case ?config(cleanup, Config) of
        undefined  -> ok;
        CleanupFun -> CleanupFun()
    end;
end_per_group(_, _) ->
    ok.

init_per_testcase(TestCase, Config) ->
    case TestCase of
        get_overflow_status_after_hitting_overload ->
            given_overload_queue_limit(1);
        _ ->
            given_overload_queue_limit(1000)
    end,
    %% test configuring non-default address
    application:set_env(xprof_gui, ip, {127, 0, 0, 1}),
    %% use a different port for tests than the default one
    application:set_env(xprof_gui, port, ?TEST_PORT),
    {ok, StartedApps} = xprof:start(),
    [{started_apps, StartedApps}|Config].

end_per_testcase(_TestCase, Config) ->
    [application:stop(App) || App <- ?config(started_apps, Config)],
    ok.

get_initialized_trace_status_on_start(_Config) ->
    {HTTPCode, JSON} = make_get_request("api/trace_status"),
    ?assertEqual(200, HTTPCode),
    ?assertEqual([{<<"status">>, <<"initialized">>}], JSON),
    ok.

get_running_status_after_setting_tracing(_Config) ->
    %% given tracing set
    given_tracing_all(),
    %% expect running  status
    {HTTPCode, JSON} = make_get_request("api/trace_status"),
    ?assertEqual(200, HTTPCode),
    ?assertEqual([{<<"status">>, <<"running">>}], JSON),
    ok.

trace_set_only_accepts_all_and_pause(_Config) ->
    ?assertMatch({204, _}, make_get_request("api/trace_set", [{"spec", "all"}])),
    ?assertMatch({204, _}, make_get_request("api/trace_set", [{"spec", "pause"}])),
    ?assertMatch({400, _}, make_get_request("api/trace_set", [{"spec", "invalid"}])),
    ok.

get_overflow_status_after_hitting_overload(_Config) ->
    %% given
    given_tracing_all(),
    given_traced("dict:new/0"),

    %% when
    %% freeze the tracer process while it receives many trace messages
    sys:suspend(xprof_core_tracer),
    dict:new(), dict:new(), dict:new(),
    sys:resume(xprof_core_tracer),
    {HTTPCode, JSON} = make_get_request("api/trace_status"),

    %% then
    ?assertEqual(200, HTTPCode),
    ?assertEqual([{<<"status">>, <<"overflow">>}], JSON),
    ok.

try_to_start_monitoring_invalid_query(_Config) ->
    {400, _} = make_get_request("api/mon_start", [{"query", "daksdasd"}]),
    ok.

monitor_valid_query(_Config) ->
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {200, Monitored}  = make_get_request("api/mon_get_all"),
    ?assertEqual([[{<<"graph_type">>, <<"percentiles">>},
                   {<<"mfa">>, [<<"dict">>, <<"new">>, 0]},
                   {<<"query">>, <<"dict:new/0">>}
                  ]],
                 Monitored),
    ok.

monitor_valid_query_twice(_Config) ->
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {409, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {200, Monitored}  = make_get_request("api/mon_get_all"),
    ?assertEqual([[{<<"graph_type">>, <<"percentiles">>},
                   {<<"mfa">>, [<<"dict">>, <<"new">>, 0]},
                   {<<"query">>, <<"dict:new/0">>}
                  ]],
                 Monitored),
    ok.

stop_monitoring(_Config) ->
    given_traced("dict:new/0"),
    {200, [[{<<"graph_type">>, <<"percentiles">>},
            {<<"mfa">>, [<<"dict">>, <<"new">>, 0]},
            {<<"query">>, <<"dict:new/0">>}
           ]
          ]} =
        make_get_request("api/mon_get_all"),
    {204, _} = make_get_request("api/mon_stop", [
                                                 {"mod", "dict"},
                                                 {"fun", "new"},
                                                 {"arity", "0"}
                                                ]),
    ?assertMatch({200, []}, make_get_request("api/mon_get_all")),
    ok.

monitor_query_with_matchspec(_Config) ->
    Q = "lists:delete(_, [E]) -> true",
    ?assertMatch({204, _}, make_get_request("api/mon_start", [{"query", Q}])),
    {200, Monitored}  = make_get_request("api/mon_get_all"),
    ?assertEqual([[{<<"graph_type">>, <<"percentiles">>},
                   {<<"mfa">>, [<<"lists">>, <<"delete">>, 2]},
                   {<<"query">>, list_to_binary(Q)}
                  ]],
                 Monitored),
    ok.

get_function_proposals_for_known_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dict:ne"}]),
    ?assertEqual([{<<"expansion">>, <<"w/0">>},
                  {<<"matches">>, [
                                   [{<<"expansion">>, <<"w/0">>},
                                    {<<"label">>, <<"dict:new/0">>}]
                                  ]}
                 ], Resp),
    ok.

no_function_proposals_for_invalid_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dadasd:asda"}]),
    ?assertEqual([{<<"expansion">>, <<>>}, {<<"matches">>, []}], Resp),
    ok.

get_data_for_not_traced_fun(_Config) ->
    ?assertMatch({404, _}, make_get_request("api/data", [
                                             {"mod", "dict"},
                                             {"fun", "new"},
                                             {"arity", "0"}
                                            ])),
    ok.

get_data_for_traced_fun(_Config) ->
    given_traced("dict:new/0"),
    ?assertMatch({200, _}, make_get_request("api/data", [
                                                         {"mod", "dict"},
                                                         {"fun", "new"},
                                                         {"arity", "0"}
                                                        ])),
    ok.

error_when_starting_not_traced_fun(_Config) ->
    Params = [{"mod", "xprof_http_e2e_SUITE"},
              {"fun", "long_function"},
              {"arity", "0"},
              {"threshold", "1"},
              {"limit", "1"}],
    ?assertMatch({404, _}, make_get_request("api/capture", Params)),
    ok.

no_capture_data_when_not_traced(_Config) ->
    ?assertMatch({404, _}, make_get_request("api/capture_data", [
                                                                 {"mod", "xprof_http_e2e_SUITE"},
                                                                 {"fun", "long_function"},
                                                                 {"arity", "0"},
                                                                 {"offset", "0"}
                                                                ])),
    ok.

error_when_stopping_not_traced_fun(_Config) ->
    MFA = [{"mod", "xprof_http_e2e_SUITE"}, {"fun", "long_function"}, {"arity", "0"}],
    ?assertMatch({404, _}, make_get_request("api/capture_stop", MFA)),
    ok.

error_when_stopping_not_started_capture(_Config) ->
    MFA = [{"mod", "xprof_http_e2e_SUITE"}, {"fun", "long_function"}, {"arity", "0"}],
    given_traced("xprof_http_e2e_SUITE:long_function/0"),

    ?assertMatch({404, _}, make_get_request("api/capture_stop", MFA)),
    ok.

capture_data_when_traced_test(_Config) ->
    given_capture_slow_calls_of("xprof_http_e2e_SUITE", "long_function", 0, 10, 10),
    %% call function once
    long_function(),
    {200, Data} = make_get_request("api/capture_data", [
                                                     {"mod", "xprof_http_e2e_SUITE"},
                                                     {"fun", "long_function"},
                                                     {"arity", "0"},
                                                     {"offset", "0"}
                                                    ]),
    ?assertEqual(1, length(proplists:get_value(<<"items">>, Data))),
    ok.

dont_receive_new_capture_data_after_stop(_Config) ->
    given_capture_slow_calls_of("xprof_http_e2e_SUITE", "long_function", 0, 10, 10),
    %% call function once
    long_function(),
    long_function(),
    %% now stop and call 2 times more
    MFA = [{"mod", "xprof_http_e2e_SUITE"}, {"fun", "long_function"}, {"arity", "0"}],
    ?assertMatch({204, _}, make_get_request("api/capture_stop", MFA)),
    long_function(),
    long_function(),

    {200, Data} = make_get_request("api/capture_data", [
                                                     {"mod", "xprof_http_e2e_SUITE"},
                                                     {"fun", "long_function"},
                                                     {"arity", "0"},
                                                     {"offset", "0"}
                                                    ]),
    ?assertEqual(2, length(proplists:get_value(<<"items">>, Data))),
    ok.

capture_data_with_formatted_exception_test(_Config) ->
    given_capture_slow_calls_of("xprof_http_e2e_SUITE", "crash_function", 0, 10, 10),
    %% call function once
    catch crash_function(),
    {200, Data} = make_get_request("api/capture_data",
                                   [
                                    {"mod", "xprof_http_e2e_SUITE"},
                                    {"fun", "crash_function"},
                                    {"arity", "0"},
                                    {"offset", "0"}
                                   ]),
    ?assertMatch([<<"** exception error: no match of right hand side value ok">>],
                 [proplists:get_value(<<"res">>, Item)
                  || Item <- proplists:get_value(<<"items">>, Data)]),
    ok.

capture_data_with_large_result(_Config) ->
    given_capture_slow_calls_of("xprof_http_e2e_SUITE", "large_result_function", 0, 10, 10),
    %% call function once
    large_result_function(),
    {200, Data} = make_get_request("api/capture_data",
                                   [
                                    {"mod", "xprof_http_e2e_SUITE"},
                                    {"fun", "large_result_function"},
                                    {"arity", "0"},
                                    {"offset", "0"}
                                   ]),
    ?assertMatch([<<"[1, 2, 3,", _/binary>>],
                 [proplists:get_value(<<"res">>, Item)
                  || Item <- proplists:get_value(<<"items">>, Data)]),
    ok.

in_this_project_we_should_detect_erlang(_Config) ->
    {200, Mode} = make_get_request("api/mode"),
    ?assertEqual([{<<"mode">>, <<"erlang">>}], Mode),
    ok.

but_it_should_return_elixir_if_it_is_forced_as_setting(_Config) ->
    given_elixir_mode_is_set(),
    {200, Mode} = make_get_request("api/mode"),
    ?assertEqual([{<<"mode">>, <<"elixir">>}], Mode),
    restore_default_mode(),
    ok.

explore_callees_of_standard_function(_Config) ->
    MFA = [{"mod", "lists"}, {"fun", "reverse"}, {"arity", "1"}],
    Expected = [<<"lists:reverse/2">>],
    {200, Calls} = make_get_request("api/get_callees", MFA),
    ?assertMatch(Expected, Calls).

explore_callees_on_not_existing_function(_Config) ->
    MFA = [{"mod", "not_existing"}, {"fun", "function"}, {"arity", "42"}],
    Expected = [],
    {200, Calls} = make_get_request("api/get_callees", MFA),
    ?assertMatch(Expected, Calls).

explore_callees_in_elixir_mode(_Config) ->
    case xprof_core_test_lib:is_elixir_available() of
        true ->
            given_elixir_mode_is_set(),
            MFA = [{"mod", "Elixir.List"}, {"fun", "flatten"}, {"arity", "1"}],
            Expected = [<<":lists.flatten/1">>],
            {200, Calls} = make_get_request("api/get_callees", MFA),
            ?assertMatch(Expected, Calls),
            restore_default_mode(),
            ok;
        false ->
            io:format("Elixir not found, skipping test."),
            ok
    end.

core_not_running(_Config) ->
    ok = application:stop(xprof_core),
    ?assertEqual({500, []}, make_get_request("api/trace_status")),
    ?assertEqual({500, []}, make_get_request("api/all_monitored")),
    ok.

%%
%% Givens
%%
given_tracing_all() ->
    {204, _} = make_get_request("api/trace_set", [{"spec", "all"}]),
    ok.

given_overload_queue_limit(Limit) ->
    application:set_env(xprof_core, max_tracer_queue_len, Limit).

given_elixir_mode_is_set() ->
    application:set_env(xprof_core, mode, elixir).

given_traced(Fun) ->
    {204, _} = make_get_request("api/mon_start", [{"query", Fun}]),
    ok.

given_capture_slow_calls_of(Mod, Fun, Arity, Threshold, Limit) ->
    ArityStr = integer_to_list(Arity),
    given_traced(Mod ++ ":" ++ Fun ++ "/" ++ ArityStr),
    given_tracing_all(),
    Params = [{"mod", Mod}, {"fun", Fun}, {"arity", ArityStr},
              {"threshold", integer_to_list(Threshold)},
              {"limit", integer_to_list(Limit)}],
    {200, _} = make_get_request("api/capture", Params).

%%
%% Helpers
%%
restore_default_mode() ->
    application:set_env(xprof_core, mode, erlang).

long_function() ->
    timer:sleep(50),
    %% This list used to be formatted as a latin1 printable string
    %% and the json encoder used to crash on it when returning the
    %% captured return value.
    %% Now it should be formatted as a unicode string.
    [164].

large_result_function() ->
    timer:sleep(50),
    %% When using jiffy as json encoder, instead of a binary it might
    %% return an iolist (it splits up the result into a list of
    %% binaries if the terms are too large). This used to crash the
    %% xprof cowboy handler.
    lists:seq(1, 1000).

crash_function() ->
    dummy = timer:sleep(50).

make_get_request(Path) ->
    make_get_request(Path, []).

make_get_request(Path, Params) ->
    EncodedParams = proplist_to_query_string(Params),
    URL =
        "http://127.0.0.1:" ++ integer_to_list(?TEST_PORT) ++
        "/" ++ Path ++ "?" ++  EncodedParams,
    {ok, {{_Ver, HTTPCode, _Reason}, _Headers, Body}} = httpc:request(URL),
    {HTTPCode, decode_json(Body)}.

decode_json("") ->
    "";
decode_json(Body) ->
    sort_json(jsone:decode(list_to_binary(Body), [{object_format, proplist}])).

sort_json([{_, _} | _] = Json) ->
    lists:sort([{K, sort_json(V)} || {K, V} <- Json]);
sort_json([_ | _] = Json) ->
    [sort_json(V) || V <- Json];
sort_json(Json) ->
    Json.


-ifdef(OTP_RELEASE).
%% uri_string module was introduced in OTP 21
proplist_to_query_string(PL) ->
    uri_string:compose_query(PL).

-else.
%% pre-OTP 21
%% http_uri module is deprecated in OTP 23
%% and scheduled for removal in OTP 25
proplist_to_query_string([]) ->
    "";
proplist_to_query_string([{K, V}]) ->
    K ++ "=" ++ http_uri:encode(V);
proplist_to_query_string([{K, V} | Rest]) ->
    K ++ "=" ++ http_uri:encode(V) ++ "&" ++ proplist_to_query_string(Rest).

-endif.
