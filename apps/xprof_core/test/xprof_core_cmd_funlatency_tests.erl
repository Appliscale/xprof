-module(xprof_core_cmd_funlatency_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_cmd_funlatency).

expand_query_test_() ->
    [?_assertEqual({<<"atency ">>,
                    [{<<"atency ">>, <<"funlatency">>, <<"Measure latency of function calls">>}]},
                   xprof_core_cmd:expand_query(<<"#funl">>)),
     ?_assertEqual({<<>>,
                    [{<<"mfa = ">>, <<"mfa">>},
                     {<<"retmatch = ">>, <<"retmatch">>}]},
                   xprof_core_cmd:expand_query(<<"#funlatency ">>)),
     ?_assertEqual({<<"match = ">>, [{<<"match = ">>, <<"retmatch">>}]},
                   xprof_core_cmd:expand_query(<<"#funlatency ret">>)),
     ?_assertEqual({<<"a = ">>, [{<<"a = ">>, <<"mfa">>}]},
                   xprof_core_cmd:expand_query(<<"#funlatency mf">>))
    ].

process_query_test_() ->
    [?_assertEqual({error, "dummy is not a valid parameter of command funlatency"},
                  xprof_core:monitor_pp(<<"#funlatency dummy = 1">>)),
     ?_assertEqual({error,"Error converting parameter retmatch to internal format: Must be a fun of arity 1 or 2"},
                   xprof_core:monitor_pp(<<"#funlatency retmatch = fun() -> true end, ",
                                           "mfa = m:f/1">>)),
     ?_assertEqual({error,"Error converting parameter retmatch to internal format: illegal pattern at column 25"},
                   xprof_core:monitor_pp(<<"#funlatency retmatch = A/B, ",
                                           "mfa = m:f/1">>)),
     ?_assertEqual({error,"Error converting parameter retmatch to internal format: record r undefined at column 24"},
                   xprof_core:monitor_pp(<<"#funlatency retmatch = #r{}, ",
                                           "mfa = m:f/1">>)),
     ?_assertEqual({error,"Mandatory parameter mfa missing"},
                   xprof_core:monitor_pp(<<"#funlatency retmatch = _">>)),
     ?_assertMatch({error,
                    "Error converting parameter mfa to internal format: "
                    "expression is not an xprof match-spec fun" ++ _},
                   xprof_core:monitor_pp(<<"#funlatency mfa = 12">>)),

     ?_assertEqual({error,"dummy is not a valid parameter of command funlatency"},
                   xprof_core:monitor(funlatency, [{dummy, 1}, {mfa, {m, f, 1}}])),
     ?_assertEqual({error,"Error converting parameter retmatch to internal format: Must be a fun of arity 1 or 2"},
                   xprof_core:monitor(funlatency, [{retmatch, 12}, {mfa, "m:f/1"}]))
    ].

retmatch_test() ->
    {start_cmd, _Cmd, Options, _CmdCB, _Query} =
        xprof_core_cmd:process_query(<<"#funlatency retmatch = _, mfa = m:f/1">>, []),
    MFASpec = proplists:get_value(mfa, Options),
    {ok, State0} = ?M:init(Options, MFASpec),
    {Stats, _State1} = ?M:take_snapshot(State0),
    ?assertEqual(0, proplists:get_value(count, Stats)),
    ?assertEqual(0, proplists:get_value(total_count, Stats)),
    ?assertEqual(0, proplists:get_value(match_rate, Stats)),
    ?assertEqual(0, proplists:get_value(min, Stats)),
    ?assertEqual(0, proplists:get_value(max, Stats)),
    ok.
