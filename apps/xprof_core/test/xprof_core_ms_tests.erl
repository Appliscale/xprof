-module(xprof_core_ms_tests).

%% for testing record syntax in match spec funs
-export([test_fun/1]).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_ms).
-define(DEFAULT_MS, {[{'_', [], [{exception_trace}, {message, arity}]}],
                     [{'_', [], [{exception_trace}, {message, '$_'}]}]}).

%% for testing record syntax in match spec funs
-type t() :: integer().
-record(rec, {f1 :: t(), f2 :: xprof_core:mode()}).

tokens_test_() ->
    [?_assertEqual(
        {error,"expression is not an xprof match-spec fun []"},
        ?M:fun2ms("")),
     ?_assertEqual(
        {error,"unterminated atom starting with 'true' at column 16"},
        ?M:fun2ms("m:f(_) -> 'true")),
     ?_assertMatch(
        {error,"expression is not an xprof match-spec fun" ++ _},
        ?M:fun2ms("a+b"))
    ].

parse_test_() ->
    [?_assertEqual(
        {ok, {{m, f, 1}, ?DEFAULT_MS}},
        ?M:fun2ms("m:f/1")),
     ?_assertEqual(
        {error,"syntax error before: '->' at column 4"},
        ?M:fun2ms("m:f(")),
     ?_assertEqual(
        {error,"syntax error before: '.' at column 16"},
        ?M:fun2ms("m:f() -> begin true")),
     ?_assertEqual(
        {error,"expression is not an xprof match-spec fun"},
        ?M:fun2ms("m:f f/1, case T of true"))
    ].

ensure_dot_test_() ->
    MSs = {[{['_'],[],[{exception_trace},{message,arity},true]}],
           [{['_'],[],[{exception_trace},{message,'$_'},true]}]},
    [?_assertEqual(
        {ok, {{m, f, 1}, MSs}},
        ?M:fun2ms("m:f(_) -> true")),
     ?_assertEqual(
        {ok, {{m, f, 1}, MSs}},
        ?M:fun2ms("m:f(_) -> true.")),
     ?_assertEqual(
        {ok, {{m, f, 1}, MSs}},
        ?M:fun2ms("m:f(_) -> true end."))
    ].

ensure_body_test_() ->
    MS = fun(Args, Guards) ->
                 {[{Args,Guards,[{exception_trace},{message,arity},true]}],
                  [{Args,Guards,[{exception_trace},{message,'$_'},true]}]
                 }
         end,
    [?_assertEqual(
        {error,"syntax error before: '->' at column 5"},
        ?M:fun2ms("m:f -> true")),
     ?_assertEqual(
        {error,"syntax error before: '->' at column 7"},
        ?M:fun2ms("m:f ( -> true")),
     ?_assertEqual(
        {error,"syntax error before: 'end' at column 19"},
        ?M:fun2ms("m:f (a) -> true;(_)")),
     ?_assertEqual(
        {ok, {{m, f, 1}, MS(['_'], [])}},
        ?M:fun2ms("m:f(_)")),
     ?_assertEqual(
        {ok, {{m, f, 1}, MS(['$1'], [{'>','$1',1}])}},
        ?M:fun2ms("m:f(A) when A > 1"))
    ].

ms_test_() ->
    [?_assertEqual(
        {error,
         "matching (=) in fun head cannot be translated into a match-spec"},
        ?M:fun2ms("m:f(A = {B, _}) -> {A, B}")),
     ?_assertEqual(
        {error,
         "variable 'B' is unbound at column 17"},
        ?M:fun2ms("m:f(A) when A > B")),
     ?_assertEqual(
        {ok, {{m, f, 0},
              {[{[],[],[{exception_trace},{message,arity},true]}],
               [{[],[],[{exception_trace},{message,'$_'},true]}]}}},
        ?M:fun2ms("m:f() -> true"))
    ].

records_test_() ->
    RecMSs = {[{[{rec,1,'_'}], [], [{exception_trace},{message,arity},true]}],
              [{[{rec,1,'_'}], [], [{exception_trace},{message,'$_'},true]}]},
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
     [?_assertEqual(
         {ok, {{?MODULE, test_fun, 1}, RecMSs}},
         ?M:fun2ms("xprof_core_ms_tests:test_fun(#rec{f1 = 1}) -> true")),
      ?_assertEqual(
         {error,"fun guard contains unknown record type rec2 at column 14"},
         ?M:fun2ms("m:f(R) when R#rec2.f1 =/= 1 -> true"))
     ]}.

traverse_ms_test_() ->
    [fun() ->
             {ok, {MFA, {MSOff, MSOn}}} =
                 ?M:fun2ms("m:f(a, _) -> message(false);"
                           "   (b, _) -> message(true);"
                           "   (_, C) -> message(C) end."),
             ?assertEqual({m, f, 2}, MFA),
             %% capture args off
             ?assertEqual(
                [%% false -> false: no trace
                 {[a,'_'], [], [{exception_trace},{message,arity},{message,false}]},
                 %% true -> arity: trace without args
                 {[b,'_'], [], [{exception_trace},{message,arity},{message,arity}]},
                 %% custom msg -> arity: trace without args
                 {['_','$1'], [], [{exception_trace},{message,arity},
                                   {message,{'andalso',{'=/=','$1',false},arity}}]}],
                MSOff),
             %% capture args on
             ?assertEqual(
                [%% false -> false: no trace
                 {[a,'_'], [], [{exception_trace},{message,'$_'},{message,false}]},
                 %% true -> '$_' aka object(): trace with all args
                 {[b,'_'], [], [{exception_trace},{message,'$_'},{message,'$_'}]},
                 %% custom msg -> custom msg: trace with one arg only
                 {['_','$1'], [], [{exception_trace},{message,'$_'},{message,'$1'}]}],
                MSOn)
     end,
     fun() ->
             %% complicated condition within `message' action-function
             {ok, {MFA, {MSOff, MSOn}}} = ?M:fun2ms("m:f(A) -> message(A > 1 andalso A + 1)"),
             ?assertEqual({m, f, 1}, MFA),
             ?assertMatch({ok, false, _, _}, erlang:match_spec_test([1], MSOff, trace)),
             ?assertMatch({ok, arity, _, _}, erlang:match_spec_test([2], MSOff, trace)),
             ?assertMatch({ok, false, _, _}, erlang:match_spec_test([1], MSOn, trace)),
             ?assertMatch({ok, 3, _, _}, erlang:match_spec_test([2], MSOn, trace))
     end
    ].

fun2ms_elixir_test_() ->
    Tests =
        {setup,
         fun() -> xprof_core_lib:set_mode(elixir) end,
         fun(_) -> application:unset_env(xprof_core, mode) end,
         [?_assertEqual(elixir, xprof_core_lib:get_mode()),
          ?_assertEqual({ok, {{'Elixir.Mod','fun',1}, ?DEFAULT_MS}},
                        ?M:fun2ms("Mod.fun/1")),
          ?_assertMatch({ok, {{'Elixir.Mod','fun',0},
                              {[{[], [], _}], [{[], [], _}]}}},
                        ?M:fun2ms("Mod.fun")),
          ?_assertMatch({ok,
                         {{'Elixir.Mod','fun',2},
                          {[{[data, '_'], [], _}], [{[data, '_'], [], _}]}
                         }},
                        ?M:fun2ms("Mod.fun(:data, _)")),
          ?_assertMatch({ok,
                         {{'Elixir.Mod','fun',2},
                          {[{[data,'$1'], [{'>','$1',1}], _}],
                           [{[data,'$1'], [{'>','$1',1}], _}]}
                         }},
                        ?M:fun2ms("Mod.fun(:data, a) when a > 1")),
          %% bug in Elixir up to 1.4.2
          %% https://github.com/elixir-lang/elixir/issues/5799
          %% ?_assertMatch({ok, {{'Elixir.Mod','fun',0},
          %%                     {[{[], [{'>',2,1}], _}], _}}},
          %%               ?M:fun2ms("Mod.fun() when 2 > 1")),

          %% full match-spec funs containing "->"
          ?_assertMatch({ok,
                         {{'Elixir.Mod','fun',0},
                          {[{[], [], _}],
                           [{[],[],
                             [{exception_trace},{message,'$_'},{message,data}]}]}
                         }},
                        ?M:fun2ms("Mod.fun() -> message(:data)")),
          ?_assertMatch({ok,
                         {{'Elixir.Mod','fun',0},
                          {[{[], [], _}],
                           [{[],[],
                             [{exception_trace},{message,'$_'},{message,data}]}]}
                         }},
                        ?M:fun2ms("Mod.fun -> message(:data)")),
          %% bug in Elixir up to 1.4.2
          %% https://github.com/elixir-lang/elixir/issues/5799
          %% ?_assertMatch({ok,
          %%                {{'Elixir.Mod','fun',
          %%                  {[{[], [{'>',2,1}], _}], _}}
          %%                }},
          %%               ?M:fun2ms("Mod.fun() when 2 > 1 -> true")),
          ?_assertMatch({ok,
                         {{'Elixir.Mod','fun',2},
                          {[{[data,'$1'], [{'>','$1',1}], _}],
                           [{[data,'$1'], [{'>','$1',1}],
                             [{exception_trace},{message,'$_'},{message,'$1'}]}]}
                         }},
                        ?M:fun2ms("Mod.fun(:data, a) when a > 1 -> message(a)"))
         ]},
    xprof_core_test_lib:run_elixir_unit_tests(Tests).

test_fun(#rec{}) ->
    ok.
