-module(xprof_core_erlang_syntax_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_erlang_syntax).
%% utf-8 non-breaking space
-define(NBSP, 194, 160).

%% for testing record syntax pretty-printing
-record(rec, {f1, f2 :: xprof_core:mode()}).

parse_incomplete_query_test_() ->
    [?_assertEqual({incomplete_cmd, "cm"},
                   ?M:parse_incomplete_query("cm")),
     ?_assertEqual({incomplete_key, "ke", cmd, []},
                   ?M:parse_incomplete_query("cmd ke")),
     ?_assertEqual({incomplete_key, {key, "="}, cmd, []},
                   ?M:parse_incomplete_query("cmd key =")),
     ?_assertEqual({incomplete_value, key, "", cmd, []},
                   ?M:parse_incomplete_query("cmd key = ")),
     ?_assertEqual({incomplete_value, key, "va", cmd, []},
                   ?M:parse_incomplete_query("cmd key = va")),
     ?_assertMatch({incomplete_key, "", cmd, [{k1, {integer, _, 1}}]},
                   ?M:parse_incomplete_query("cmd k1 = 1,")),
     ?_assertMatch({incomplete_key, "", cmd, [{k1, {integer, _, 1}}]},
                   ?M:parse_incomplete_query("cmd k1 = 1, ")),
     ?_assertMatch({incomplete_key, "k", cmd, [{k1, {integer, _, 1}}]},
                   ?M:parse_incomplete_query("cmd k1 = 1, k"))
    ].

fmt_test_() ->
    {setup,
     fun() ->
             ok = application:set_env(xprof_core, load_records, [?MODULE]),
             {ok, Pid} = xprof_core_records:start_link(),
             Pid
     end,
     fun(Pid) ->
             application:unset_env(xprof_core, load_records),
             unlink(Pid),
             exit(Pid, kill)
     end,
     [?_assertEqual(<<"[1, 2, #rec{ f1", ?NBSP, "= 1, f2", ?NBSP, "= erlang}]">>,
                    ?M:fmt_term([1, 2, #rec{f1 = 1, f2 = erlang}])),
      ?_assertEqual(<<"** exception error: no match of right hand side value dummy">>,
                    ?M:fmt_exception(error, {badmatch, dummy})),
      ?_assertEqual(<<"** exception throw: dummy">>,
                    ?M:fmt_exception(throw, dummy)),
      ?_assertEqual(<<"** exception throw: [1, 2, #rec{ f1", ?NBSP, "= 1, f2", ?NBSP, "= erlang}]">>,
                    ?M:fmt_exception(throw, [1, 2, #rec{f1 = 1, f2 = erlang}])),
      ?_assertEqual(<<"** exception exit: {noproc, {gen_server, call, [server, msg]}}">>,
                    ?M:fmt_exception(exit, {noproc, {gen_server, call, [server, msg]}}))
     ]}.
