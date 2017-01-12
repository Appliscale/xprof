-module(xprof_http_e2e_SUITE).

-include_lib("common_test/include/ct.hrl").
-include_lib("eunit/include/eunit.hrl").

-compile(export_all).

%% CT funs

all() ->
    [
     get_paused_trace_status_on_start,
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
     error_when_stopping_not_started_capture,
     dont_receive_new_capture_data_after_stop
    ].

init_per_suite(Config) ->
    inets:start(),
    Config.

end_per_suite(_Config) ->
    ok.

init_per_testcase(_TestCase, Config) ->
    xprof:start(),
    Config.

end_per_testcase(_TestCase, _Config) ->
    xprof:stop(),
    given_overload_queue_limit(1000),
    ok.

get_paused_trace_status_on_start(_Config) ->
    {HTTPCode, JSON} = make_get_request("api/trace_status"),
    ?assertEqual(200, HTTPCode),
    ?assertEqual([{<<"status">>, <<"paused">>}], JSON),
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
    ?assertMatch({200, _}, make_get_request("api/trace_set", [{"spec", "all"}])),
    ?assertMatch({200, _}, make_get_request("api/trace_set", [{"spec", "pause"}])),
    ?assertMatch({400, _}, make_get_request("api/trace_set", [{"spec", "invalid"}])),
    ok.


get_overflow_status_after_hitting_overload(_Config) ->
    %% given
    given_tracing_all(),
    given_overload_queue_limit(1),
    given_traced("dict:new/0"),

    %% when
    dict:new(), dict:new(), dict:new(),
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
    ?assertEqual([[<<"dict">>, <<"new">>, 0]], Monitored),
    ok.

monitor_valid_query_twice(_Config) ->
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {204, _} = make_get_request("api/mon_start", [{"query", "dict:new/0"}]),
    {200, Monitored}  = make_get_request("api/mon_get_all"),
    ?assertEqual([[<<"dict">>, <<"new">>, 0]], Monitored),
    ok.

stop_monitoring(_Config) ->
    given_traced("dict:new/0"),
    {200, [[<<"dict">>, <<"new">>, 0]]}  = make_get_request("api/mon_get_all"),
    {204, _} = make_get_request("api/mon_stop", [
                                                 {"mod", "dict"},
                                                 {"fun", "new"},
                                                 {"arity", "0"}
                                                ]),
    ?assertMatch({200, []}, make_get_request("api/mon_get_all")),
    ok.

monitor_query_with_matchspec(_Config) ->
    Q = "lists:delete([_, [E]]) -> true",
    ?assertMatch({204, _}, make_get_request("api/mon_start", [{"query", Q}])),
    ok.

get_function_proposals_for_known_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dict:ne"}]),
    ?assertEqual([[<<"dict">>,<<"new">>,0]], Resp),
    ok.

no_function_proposals_for_invalid_module(_Config) ->
    {200, Resp} = make_get_request("api/funs", [{"query", "dadasd:asda"}]),
    ?assertEqual([], Resp),
    ok.

get_data_for_not_traced_fun(_Config) ->
    ?assertMatch({404, _}, make_get_request("api/data", [
                                             {"mod", "dict"},
                                             {"fun", "new"},
                                             {"arity", "*"}
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
    ?assertMatch({500, _}, make_get_request("api/capture_stop", MFA)),
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

%%
%% Givens
%%
given_tracing_all() ->
    {200, _} = make_get_request("api/trace_set", [{"spec", "all"}]),
    ok.

given_overload_queue_limit(Limit) ->
    application:set_env(xprof, max_tracer_queue_len, Limit).

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
long_function() ->
    timer:sleep(50).

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

