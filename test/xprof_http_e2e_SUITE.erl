-module(xprof_http_e2e_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

%% CT callbacks
-export([all/0,
         init_per_suite/1,
         end_per_suite/1,
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
         no_capture_data_when_not_traced/1,
         capture_data_when_traced_test/1,
         capture_data_with_formatted_exception_test/1,
         error_when_stopping_not_started_capture/1,
         dont_receive_new_capture_data_after_stop/1,
         in_this_project_we_should_detect_erlang/1,
         but_it_should_return_elixir_if_it_is_forced_as_setting/1
        ]).

%% CT funs

all() ->
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
     no_capture_data_when_not_traced,
     capture_data_when_traced_test,
     capture_data_with_formatted_exception_test,
     error_when_stopping_not_started_capture,
     dont_receive_new_capture_data_after_stop,
     in_this_project_we_should_detect_erlang,
     but_it_should_return_elixir_if_it_is_forced_as_setting
    ].

init_per_suite(Config) ->
    inets:start(),
    Config.

end_per_suite(_Config) ->
    ok.

init_per_testcase(TestCase, Config) ->
    case TestCase of
        get_overflow_status_after_hitting_overload ->
            given_overload_queue_limit(1);
        _ ->
            given_overload_queue_limit(1000)
    end,
    {ok, _} = xprof:start(),
    Config.

end_per_testcase(_TestCase, _Config) ->
    xprof:stop(),
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
    sys:suspend(xprof_tracer),
    dict:new(), dict:new(), dict:new(),
    sys:resume(xprof_tracer),
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
    ?assertEqual([[<<"dict">>, <<"new">>, 0, <<"dict:new/0">>]], Monitored),
    ok.

monitor_valid_query_twice(_Config) ->
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {200, Monitored}  = make_get_request("api/mon_get_all"),
    ?assertEqual([[<<"dict">>, <<"new">>, 0, <<"dict:new/0">>]], Monitored),
    ok.

stop_monitoring(_Config) ->
    given_traced("dict:new/0"),
    {200, [[<<"dict">>, <<"new">>, 0, <<"dict:new/0">>]]} =
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
    ?assertEqual([[<<"lists">>, <<"delete">>, 2, list_to_binary(Q)]],
                 Monitored),
    ok.

get_function_proposals_for_known_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dict:ne"}]),
    ?assertEqual([<<"dict:new/0">>], Resp),
    ok.

no_function_proposals_for_invalid_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dadasd:asda"}]),
    ?assertEqual([], Resp),
    ok.

get_data_for_not_traced_fun(_Config) ->
    ?assertMatch({404, _}, make_get_request("api/data", [
                                             {"mod", "dict"},
                                             {"fun", "new"},
                                             {"arity", "_"}
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

no_capture_data_when_not_traced(_Config) ->
    ?assertMatch({404, _}, make_get_request("api/capture_data", [
                                                                 {"mod", "xprof_http_e2e_SUITE"},
                                                                 {"fun", "long_function"},
                                                                 {"arity", "0"},
                                                                 {"offset", "0"}
                                                                ])),
    ok.

error_when_stopping_not_started_capture(_Config) ->
    MFA = [{"mod", "xprof_http_e2e_SUITE"}, {"fun", "long_function"}, {"arity", "0"}],
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

%%
%% Givens
%%
given_tracing_all() ->
    {204, _} = make_get_request("api/trace_set", [{"spec", "all"}]),
    ok.

given_overload_queue_limit(Limit) ->
    application:set_env(xprof, max_tracer_queue_len, Limit).

given_elixir_mode_is_set() ->
    application:set_env(xprof, mode, elixir).

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
    application:set_env(xprof, mode, erlang).

long_function() ->
    timer:sleep(50).

crash_function() ->
    dummy = timer:sleep(50).

make_get_request(Path) ->
    make_get_request(Path, []).

make_get_request(Path, Params) ->
    EncodedParams = proplist_to_query_string(Params),
    URL = "http://127.0.0.1:7890/" ++ Path ++ "?" ++  EncodedParams,
    {ok, {{_Ver, HTTPCode, _Reason}, _Headers, Body}} = httpc:request(URL),
    {HTTPCode, decode_json(Body)}.

decode_json("") ->
    "";
decode_json(Body) ->
    jsone:decode(list_to_binary(Body), [{object_format, proplist}]).

proplist_to_query_string([]) ->
    "";
proplist_to_query_string([{K, V}]) ->
    K ++ "=" ++ http_uri:encode(V);
proplist_to_query_string([{K, V} | Rest]) ->
    K ++ "=" ++ http_uri:encode(V) ++ "&" ++ proplist_to_query_string(Rest).

