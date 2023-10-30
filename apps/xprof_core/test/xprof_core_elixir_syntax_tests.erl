-module(xprof_core_elixir_syntax_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_elixir_syntax).

parse_match_spec_test_() ->
    %% some literals loose their location information in elixir_parser
    %% but it is backfilled later by string_to_quoted
    %% LiteralLine is 0 until Elixir 1.12, and 1 since 1.13
    Tests =
        [%% arity explicitly defined
         ?_assertEqual({mfa,{'Elixir.Mod','fun',1}},
                       ?M:parse_match_spec("Mod.fun/1")),
         ?_assertEqual({mfa,{'Elixir.Mod','fun',1}},
                       ?M:parse_match_spec("Elixir.Mod.fun/1")),
         ?_assertEqual({mfa,{'Elixir.App.Mod','fun',1}},
                       ?M:parse_match_spec("App.Mod.fun/1")),
         ?_assertEqual({mfa,{mod,'fun?',1}},
                       ?M:parse_match_spec(":mod.fun?/1")),

         %% full match-spec funs
         ?_assertEqual({clauses,'Elixir.Mod','fun',
                        [{clause,1,
                          [{var,1,'_'}],
                          [],
                          [{call,1,{atom,1,return_trace},[]}]}]},
                       ?M:parse_match_spec("Mod.fun(_) -> return_trace()")),
         ?_assertMatch({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,
                          [{var,1,Var_a}, {var,1,'_'}],
                          [],
                          [{call,1,{atom,1,message},[{var, 1, Var_a}]}]}]},
                       ?M:parse_match_spec("App.Mod.fun a, _ -> message a")),
         ?_assertMatch({clauses,mod,'fun',
                        [{clause,1,[{atom,LiteralLine,ok}],[],[{atom,LiteralLine,true}]}]},
                       ?M:parse_match_spec(":mod.fun(:ok) -> true")),
         ?_assertMatch({clauses,'Elixir.Mod','fun',
                        [{clause,1,
                          [{var,1,Var_a}],
                          [[{op,1,'>',{var,1,Var_a},{integer,_LiteralLine,1}}]],
                          [{call,1,{atom,1,return_trace},[]}]}]},
                       ?M:parse_match_spec("Mod.fun(a) when a > 1 -> return_trace()")),

         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun" ++ _},
            catch ?M:parse_match_spec("")),
         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun" ++ _},
            catch ?M:parse_match_spec("a+b")),

         %% tokenizer errors
         ?_assertEqual(
            {error,"missing terminator: \" (for string starting at line 1) at column 1"},
            catch ?M:parse_match_spec("\"Mod.fun/1")),
         ?_assertEqual(
            {error,"missing terminator: ' (for string starting at line 1) at column 15"},
            catch ?M:parse_match_spec("Mod.fun(_) -> 'true")),
         ?_assertEqual(
            {error,"syntax error before:  at column 4"},
            catch ?M:parse_match_spec("Mod.")),
         ?_assertEqual(
            {error,"syntax error before:  at column 9"},
            catch ?M:parse_match_spec("Mod.fun *")),
         %% real-world typo :)
         ?_assertEqual(
            {error,"syntax error before: '->' at column 12"},
            catch ?M:parse_match_spec("Mod.fun(a) -> when a > 1 -> true")),

         %% parse_quoted does not match
         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun"},
            catch ?M:parse_match_spec("a+b ->")),
         %% fn_to_clauses
         ?_assertMatch(
            {error,"nofile:1: cannot invoke remote function Mod.fun/1 inside " ++ _},
            catch ?M:parse_match_spec("Mod.fun(1) -> true; Mod.fun(2) -> false")),
         ?_assertMatch(
            {error,"nofile:1: cannot mix clauses with different arities in" ++ _},
            catch ?M:parse_match_spec("Mod.fun(1) -> true; (1, 2) -> false")),

         ?_assertMatch(
            ok,
            try ?M:parse_match_spec("Mod.fun f/1") of
                %% Until Elixir 1.14.2 this was not caught.
                %% This seems to be a one-arg function which passes parse_match_spec
                %% (same as "Mod.fun(f/1)"
                %% but will fail conversion to matchspec
                {clauses,'Elixir.Mod','fun', [_]} -> ok
            catch
                {error,"nofile:1: cannot invoke remote function :erlang.//2 inside " ++ _} ->
                    %% error message slightly changed in Elixir 1.8.0
                    ok
            end),

         %% Valid quoted syntax - shortcuts

         %% Missing args and body
         ?_assertMatch({clauses,'Elixir.App.Mod','fun',[{clause,1,[],[],[{atom,_LiteralLine,true}]}]},
                       ?M:parse_match_spec("App.Mod.fun")),
         ?_assertMatch({clauses,mod,'fun',[{clause,1,[],[],[{atom,_LiteralLine,true}]}]},
                       ?M:parse_match_spec(":mod.fun")),

         %% Only args present, no body
         ?_assertMatch({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,[{atom,LiteralLine,ok}],[],[{atom,LiteralLine,true}]}]},
                       ?M:parse_match_spec("App.Mod.fun(:ok)")),
         ?_assertMatch({clauses,mod,'fun',
                        [{clause,1,[{atom,LiteralLine,ok}],[],[{atom,LiteralLine,true}]}]},
                       ?M:parse_match_spec(":mod.fun(:ok)")),

         %% Args and guards present, but no body
         ?_assertMatch({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,[{var,1,Var_a}],
                          [[{op,1,'<',{var,1,Var_a},{integer,LiteralLine,1}}],
                           [{op,1,'>',{var,1,Var_a},{integer,LiteralLine,10}}]],
                          [{atom,LiteralLine,true}]}]},
                       ?M:parse_match_spec("App.Mod.fun(a) when a < 1 when a > 10"))
        ],
    xprof_core_test_lib:run_elixir_unit_tests(Tests).

parse_query_test_() ->
    Tests =
        [?_assertEqual({error, "Missing command name"},
                       ?M:parse_query("%")),
         ?_assertEqual({ok, cm, []},
                       ?M:parse_query("%cm")),
         ?_assertEqual({error, "unexpected token ';' at column 6"},
                       ?M:parse_query("%cmd ;")),
         ?_assertEqual({error, "Missing : and value for parameter :ke"},
                       ?M:parse_query("%cmd ke")),
         ?_assertEqual({error, "Missing value for parameter key:"},
                       ?M:parse_query("%cmd key:")),
         ?_assertEqual({error, "Missing value for parameter key:"},
                       ?M:parse_query("%cmd key: ")),
         ?_assertEqual(%%{error,"Incomplete value for parameter :key"},
                       {error, "missing terminator: ] (for \"[\" starting at line 1) at column 16"},
                       ?M:parse_query("%cmd key: [1, 2,")),
         ?_assertMatch({error, "Expected parameter name missing at the end of the query"},
                       ?M:parse_query("%cmd k1: 1,")),
         ?_assertMatch({error, "Expected parameter name missing at the end of the query"},
                       ?M:parse_query("%cmd k1: 1, ")),
         ?_assertMatch({error, "Missing : and value for parameter :k"},
                       ?M:parse_query("%cmd k1: 1, k")),
         ?_assertMatch({ok, cmd, [{k1, {integer, _, 1}}, {k2, {integer, _, 2}}]},
                       ?M:parse_query("%cmd k1: 1, k2: 2")),
         ?_assertMatch(%%{error, "missing comma at column 12"},
                       {error, "Incomplete value for parameter k1:"},
                       ?M:parse_query("%cmd k1: 1 k2: 2")),

         %% real-world examples
         ?_assertMatch(
            {ok, argdist, [{enum, {integer, _, 2}}, {mfa, "M.f(b) when is_boolean(b) -> message(b)"}]},
            ?M:parse_query("%Argdist enum: 2, mfa: M.f(b) when is_boolean(b) -> message(b)")),
         ?_assertMatch(
            {ok, funlatency, [{caller, {op, _, '/',
                                        {call, _,
                                         {remote, _,
                                          {atom, _, 'Elixir.String'},
                                          {atom, _ , split}},
                                         []},
                                        {integer, _, 3}}
                              },
                              {mfa, "Keyword.get/3"}]},
            ?M:parse_query("%Funlatency caller: String.split/3, mfa: Keyword.get/3"))
        ],
    xprof_core_test_lib:run_elixir_unit_tests(Tests).

parse_incomplete_query_test_() ->
    Tests =
        [?_assertEqual({incomplete_cmd, ""},
                       ?M:parse_incomplete_query("")),
         ?_assertEqual({incomplete_cmd, "cm"},
                       ?M:parse_incomplete_query("cm")),
         ?_assertEqual({ok, cmd, []},
                       ?M:parse_incomplete_query("cmd ")),
         ?_assertEqual({incomplete_key, "ke", cmd, []},
                       ?M:parse_incomplete_query("cmd ke")),
         ?_assertEqual({incomplete_key, {key, ":"}, cmd, []},
                       ?M:parse_incomplete_query("cmd key:")),
         ?_assertEqual({incomplete_value, key, "", cmd, []},
                       ?M:parse_incomplete_query("cmd key: ")),
         ?_assertEqual({incomplete_value, key, "", cmd, []},
                       ?M:parse_incomplete_query("cmd key: 12")),
         ?_assertEqual({incomplete_value, key, "[1, 2", cmd, []},
                       ?M:parse_incomplete_query("cmd key: [1, 2")),
         ?_assertEqual({incomplete_value, key, "[1, 2] ++ [3, 4 ", cmd, []},
                       ?M:parse_incomplete_query("cmd key: [1, 2] ++ [3, 4 ")),
         ?_assertMatch({incomplete_key, "", cmd, [{k1, {integer, _, 1}}]},
                       ?M:parse_incomplete_query("cmd k1: 1,")),
         ?_assertMatch({incomplete_key, "", cmd, [{k1, {integer, _, 1}}]},
                       ?M:parse_incomplete_query("cmd k1: 1, ")),
         ?_assertMatch({incomplete_key, "k", cmd, [{k1, {integer, _, 1}}]},
                       ?M:parse_incomplete_query("cmd k1: 1, k")),
         ?_assertMatch({incomplete_value, k2, "", cmd, [{k1, {integer, _, 1}}]},
                       ?M:parse_incomplete_query("cmd k1: 1, k2: :v")),
         ?_assertMatch({incomplete_value, mfa, "Mod.fun(_)", cmd, [{k1, {integer, _, 1}}]},
                       ?M:parse_incomplete_query("cmd k1: 1, mfa: Mod.fun(_)"))
        ],
    xprof_core_test_lib:run_elixir_unit_tests(Tests).

fmt_test_() ->
    Tests =
        [?_assertEqual(<<"** (MatchError) no match of right hand side value: :dummy">>,
                       ?M:fmt_exception(error, {badmatch, dummy})),
         ?_assertEqual(<<"** (throw) :dummy">>,
                       ?M:fmt_exception(throw, dummy)),
         ?_assertEqual(case xprof_core_test_lib:is_elixir_version(">= 1.4.0")  of
                           true ->
                               %% in version 1.4.0 the exception description was improved
                               <<"** (exit) exited in: :gen_server.call(:server, :msg)\n    "
                                 "** (EXIT) no process: the process is not alive or "
                                 "there's no process currently associated with the given name, "
                                 "possibly because its application isn't started">>;
                           false ->
                               <<"** (exit) exited in: :gen_server.call(:server, :msg)\n    "
                                 "** (EXIT) no process">>
                       end,
                       ?M:fmt_exception(exit, {noproc, {gen_server, call, [server, msg]}}))
        ],
    xprof_core_test_lib:run_elixir_unit_tests(Tests).
