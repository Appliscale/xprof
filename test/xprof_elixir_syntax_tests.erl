-module(xprof_elixir_syntax_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_elixir_syntax).

parse_query_test_() ->
    Tests =
        [%% arity explicitly defined
         ?_assertEqual({mfa,{'Elixir.Mod','fun',1}},
                       ?M:parse_query("Mod.fun/1")),
         ?_assertEqual({mfa,{'Elixir.Mod','fun',1}},
                       ?M:parse_query("Elixir.Mod.fun/1")),
         ?_assertEqual({mfa,{'Elixir.App.Mod','fun',1}},
                       ?M:parse_query("App.Mod.fun/1")),
         ?_assertEqual({mfa,{mod,'fun?',1}},
                       ?M:parse_query(":mod.fun?/1")),

         %% full match-spec funs
         ?_assertEqual({clauses,'Elixir.Mod','fun',
                        [{clause,1,
                          [{var,1,'_'}],
                          [],
                          [{call,1,{atom,1,return_trace},[]}]}]},
                       ?M:parse_query("Mod.fun(_) -> return_trace()")),
         ?_assertEqual({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,
                          [{var,1,a@1}, {var,1,'_'}],
                          [],
                          [{call,1,{atom,1,message},[{var, 1, a@1}]}]}]},
                       ?M:parse_query("App.Mod.fun a, _ -> message a")),
         ?_assertEqual({clauses,mod,'fun',
                        [{clause,1,[{atom,0,ok}],[],[{atom,0,true}]}]},
                       ?M:parse_query(":mod.fun(:ok) -> true")),
         ?_assertEqual({clauses,'Elixir.Mod','fun',
                        [{clause,1,
                          [{var,1,a@1}],
                          [[{op,1,'>',{var,1,a@1},{integer,0,1}}]],
                          [{call,1,{atom,1,return_trace},[]}]}]},
                       ?M:parse_query("Mod.fun(a) when a > 1 -> return_trace()")),

         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun" ++ _},
            catch ?M:parse_query("")),
         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun" ++ _},
            catch ?M:parse_query("a+b")),

         %% tokenizer errors
         ?_assertEqual(
            {error,"missing terminator: \" (for string starting at line 1) at column 1"},
            catch ?M:parse_query("\"Mod.fun/1")),
         ?_assertEqual(
            {error,"missing terminator: ' (for string starting at line 1) at column 15"},
            catch ?M:parse_query("Mod.fun(_) -> 'true")),
         ?_assertEqual(
            {error,"syntax error before:  at column 4"},
            catch ?M:parse_query("Mod.")),
         ?_assertEqual(
            {error,"syntax error before:  at column 9"},
            catch ?M:parse_query("Mod.fun *")),
         %% real-world typo :)
         ?_assertEqual(
            {error,"syntax error before: '->' at column 12"},
            catch ?M:parse_query("Mod.fun(a) -> when a > 1 -> true")),

         %% parse_quoted does not match
         ?_assertMatch(
            {error,"expression is not an xprof match-spec fun"},
            catch ?M:parse_query("a+b ->")),
         %% fn_to_clauses
         ?_assertMatch(
            {error,"nofile:1: cannot invoke remote function Mod.fun/1 inside match"},
            catch ?M:parse_query("Mod.fun(1) -> true; Mod.fun(2) -> false")),
         ?_assertMatch(
            {error,"nofile:1: cannot mix clauses with different arities in" ++ _},
            catch ?M:parse_query("Mod.fun(1) -> true; (1, 2) -> false")),

         ?_assertMatch(
            ok,
            try ?M:parse_query("Mod.fun f/1") of
                %% Until Elixir 1.14.2 this was not caught.
                %% This seems to be a one-arg function which passes parse_query
                %% (same as "Mod.fun(f/1)"
                %% but will fail conversion to matchspec
                {clauses,'Elixir.Mod','fun', [_]} -> ok
            catch
                {error,"nofile:1: cannot invoke remote function :erlang.//2 inside match"} ->
                    ok
            end),

         %% Valid quoted syntax - shortcuts

         %% Missing args and body
         ?_assertEqual({clauses,'Elixir.App.Mod','fun',[{clause,1,[],[],[{atom,0,true}]}]},
                       ?M:parse_query("App.Mod.fun")),
         ?_assertEqual({clauses,mod,'fun',[{clause,1,[],[],[{atom,0,true}]}]},
                       ?M:parse_query(":mod.fun")),

         %% Only args present, no body
         ?_assertEqual({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,[{atom,0,ok}],[],[{atom,0,true}]}]},
                       ?M:parse_query("App.Mod.fun(:ok)")),
         ?_assertEqual({clauses,mod,'fun',
                        [{clause,1,[{atom,0,ok}],[],[{atom,0,true}]}]},
                       ?M:parse_query(":mod.fun(:ok)")),

         %% Args and guards present, but no body
         ?_assertEqual({clauses,'Elixir.App.Mod','fun',
                        [{clause,1,[{var,1,a@1}],
                          [[{op,1,'<',{var,1,a@1},{integer,0,1}}],
                           [{op,1,'>',{var,1,a@1},{integer,0,10}}]],
                          [{atom,0,true}]}]},
                       ?M:parse_query("App.Mod.fun(a) when a < 1 when a > 10"))
        ],
    xprof_test_lib:run_elixir_unit_tests(Tests).

fmt_test_() ->
    Tests =
        [?_assertEqual(<<"** (MatchError) no match of right hand side value: :dummy">>,
                       ?M:fmt_exception(error, {badmatch, dummy})),
         ?_assertEqual(<<"** (throw) :dummy">>,
                       ?M:fmt_exception(throw, dummy)),
         ?_assertEqual(case xprof_test_lib:is_elixir_version(">= 1.4.0")  of
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
    xprof_test_lib:run_elixir_unit_tests(Tests).
