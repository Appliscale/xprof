-module(xprof_gui_favourites_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_gui_favourites).

init_test_() ->
    Query1 = <<"test_module:expensive_fun(A) when A > 1">>,
    Query2 = <<"test_module:expensive_fun(A) when A > 2">>,
    Query3 = <<"test_module:expensive_fun(A) when A > 3">>,
    Tests = [
        {"When no favourites return empty list",
         fun() ->
             given_queries_in_config([]),
             ?assertEqual([], ?M:get_all())
         end},
        {"Queries should be returned in alphabetical order",
         fun() ->
             given_queries_in_config([query(Query2), query(Query1)]),
             ?assertEqual([Query1, Query2], ?M:get_all())
         end},
        {"Queries should be persisted and remain in alphabetical order after adding a new one",
         fun() ->
             given_queries_in_config([query(Query1), query(Query3)]),
             Result = ?M:add(Query2),
             ?assertEqual([Query1, Query2, Query3], Result),
             ?assertEqual([query(Query1), query(Query2), query(Query3)], saved_queries())
         end},
        {"Query shouldn't be added second time if it already exists",
         fun() ->
             given_queries_in_config([query(Query1), query(Query2)]),
             Result = ?M:add(Query2),
             ?assertEqual([Query1, Query2], Result),
             ?assertEqual([query(Query1), query(Query2)], saved_queries())
         end},
        {"Queries should be persisted after removing one",
         fun() ->
             given_queries_in_config([query(Query1), query(Query2), query(Query3)]),
             Result = ?M:remove(Query2),
             ?assertEqual([Query1, Query3], Result),
             ?assertEqual([query(Query1), query(Query3)], saved_queries())
         end}
    ],
    {foreach, fun init_setup/0, fun init_teardown/1, Tests}.

given_queries_in_config(Queries) ->
    meck:expect(xprof_gui_favourites_config, load_queries, 0, {ok, Queries}),
    xprof_gui_favourites:reload().

saved_queries() ->
    meck:capture(last, xprof_gui_favourites_config, save_queries, 1, 1).

init_setup() ->
    meck:new(xprof_gui_favourites_config),
    meck:expect(xprof_gui_favourites_config, save_queries, 1, ok),
    % saved queries are loaded during init, so we need to mock it before gen_server is started
    meck:expect(xprof_gui_favourites_config, load_queries, 0, {ok, []}),
    process_flag(trap_exit, true),
    {ok, Pid} = ?M:start_link(),
    Pid.

init_teardown(Pid) ->
    meck:unload(xprof_gui_favourites_config),
    exit(Pid, kill),
    ok.

query(XprofQuery) ->
    {query, [{xprof_query, binary_to_list(XprofQuery)}]}.