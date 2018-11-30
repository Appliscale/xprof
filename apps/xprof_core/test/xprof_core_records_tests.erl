-module(xprof_core_records_tests).

-export([test_fun/1]).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_records).

-record(r1, {f1}).
-record(r2, {f2 = default}).

smoke_test_() ->
    {setup,
     fun() ->
             {ok, Pid} = ?M:start_link(),
             Pid
     end,
     fun(Pid) ->
             unlink(Pid),
             exit(Pid, kill)
     end,
     [?_assertEqual([], ?M:get_record_defs()),
      ?_assertEqual([r1, r2], ?M:load_records(?MODULE)),
      ?_assertMatch([{attribute, _, record,
                      {r1,[{record_field, _, {atom, _,f1}}]}},
                     {attribute, _, record,
                      {r2,[{record_field, _, {atom, _,f2}, {atom, _, default}}]}}],
                    lists:sort(?M:get_record_defs())),
      ?_assertEqual(ok, ?M:forget_records(r2)),
      ?_assertMatch([{attribute, _, record,
                      {r1,[{record_field, _, {atom, _,f1}}]}}],
                    lists:sort(?M:get_record_defs())),
      ?_assertEqual(ok, ?M:forget_records('_')),
      ?_assertEqual([], ?M:get_record_defs())      
     ]}.

%% only to silence compilation warning about unused records
test_fun(#r1{}) ->
    #r2{}.
