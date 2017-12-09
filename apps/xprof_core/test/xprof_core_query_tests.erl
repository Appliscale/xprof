-module(xprof_core_query_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_query).

parse_query_test_() ->
    %% tokens_test_() ->
     [?_assertEqual(
         %%{error, incomplete_query},
         {error, parsing_error},
         ?M:parse_query("#cmd mfa =")),
     ?_assertEqual(
        {error,"unterminated atom starting with 'true' at column 27"},
        ?M:parse_query("#cmd mfa = m:f(_) -> 'true")),
     ?_assertMatch(
        {ok, cmd, [{mfa, "a+b"}]},
        ?M:parse_query("#cmd mfa = a+b")),

%% parse_test_() ->
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f/1"}]},
        ?M:parse_query("#cmd mfa = m:f/1")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f("}]},
        ?M:parse_query("#cmd mfa = m:f(")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f() -> begin true"}]},
        ?M:parse_query("#cmd mfa = m:f() -> begin true")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f f/1, case T of true"}]},
        ?M:parse_query("#cmd mfa = m:f f/1, case T of true")),

     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f(_)"}]},
        ?M:parse_query("#cmd mfa = m:f(_)")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f(A) when A > 1"}]},
        ?M:parse_query("#cmd mfa = m:f(A) when A > 1")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f(A, _) -> message(A)"}]},
        ?M:parse_query("#cmd mfa = m:f(A, _) -> message(A)")),
     ?_assertEqual(
        {ok, cmd, [{mfa, "m:f(a) -> message(false); (_) -> true end"}]},
        ?M:parse_query("#cmd mfa = m:f(a) -> message(false); (_) -> true end")),

     ?_assertMatch(
        {ok, argdist, [{enum, {integer,_,2}}, {mfa, "m:f(B) when is_boolean(B) -> message(B)"}]},
        ?M:parse_query("#argdist enum = 2, mfa = m:f(B) when is_boolean(B) -> message(B)")),

     ?_assertEqual(
        %%{error, "missing comma at column 12"},
        {error, parsing_error},
        ?M:parse_query("#cmd k1 = 1 k2 = 2"))

    ].
