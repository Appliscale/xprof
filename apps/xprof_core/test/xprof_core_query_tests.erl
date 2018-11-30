-module(xprof_core_query_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_query).

parse_query_test_() ->
    %% tokens_test_() ->
    [?_assertMatch(
        {ok, cmd, []},
        ?M:parse_query("#cmd")),
     ?_assertMatch(
        {error, "unexpected token \";\" at column 6"},
        ?M:parse_query("#cmd ;")),
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
     ?_assertMatch(
        {ok, funlatency, [{caller, {op, _, '/',
                                    {remote, _, {atom, _, string},
                                     {atom, _ , split}},
                                    {integer, _, 3}}
                          },
                          {mfa, "proplists:get_value/3"}]},
        ?M:parse_query("#funlatency caller = string:split/3, mfa = proplists:get_value/3")),

     ?_assertEqual(
        {error, "Missing command name"},
        ?M:parse_query("#")),
     ?_assertEqual(
        {ok, c, []},
        ?M:parse_query("#c")),
     ?_assertEqual(
        {error, "Missing = and value for parameter m"},
        ?M:parse_query("#cmd m")),
     ?_assertEqual(
        {error, "Missing value for parameter mfa"},
        ?M:parse_query("#cmd mfa =")),
     ?_assertEqual(
        {error, "Incomplete value for parameter k1"},
        ?M:parse_query("#cmd k1 = {a")),
     ?_assertEqual(
        {error, "Expected parameter name missing at the end of the query"},
        ?M:parse_query("#cmd k1 = a,")),

     ?_assertEqual(
        %%{error, "missing comma at column 12"},
        {error, "Incomplete value for parameter k1"},
        ?M:parse_query("#cmd k1 = 1 k2 = 2"))

    ].
