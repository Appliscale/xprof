-module(xprof_vm_info_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_vm_info).

get_available_funs_test_() ->
    [fun() ->
             L1 = ?M:get_available_funs(<<"">>),
             L2 = ?M:get_available_funs(<<"x">>),
             ?assert(length(L1) > length(L2)),
             ?assertEqual([], L2 -- L1),
             ?assertNotEqual([], L1 -- L2)
     end,
     {"Only global function are listed",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_vm_info">>),
              ?assert(lists:member([?M, get_available_funs, 1], L1)),
              ?assertNot(lists:member([?M, filter_funs, 2], L1))
      end},
     {"Module info is filtered out",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_vm_info">>),
              ?assertNot(lists:member([?M, module_info, 0], L1)),
              ?assertNot(lists:member([?M, module_info, 1], L1))
      end},
     {"Local functions are also listed if query contains colon",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_vm_info:">>),
              ?assert(lists:member([?M, get_available_funs, 1], L1)),
              ?assert(lists:member([?M, filter_funs, 2], L1))
      end},
     {"Generated functions are filtered out",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"xprof_vm_info:-">>))
      end},
     {"No module matches query",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"zzz">>)),
              ?assertEqual([], ?M:get_available_funs(<<"zzz:">>)),
              ?assertEqual([], ?M:get_available_funs(<<"true:">>))
      end},
     {"No function matches query",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"xprof_vm_info:zzz">>))
      end},
     {"Arity matching",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_vm_info:get_available_funs/">>),
              ?assertEqual([[?M, get_available_funs, 1]], L1),
              L2 = ?M:get_available_funs(<<"xprof_vm_info:get_available_funs/1">>),
              ?assertEqual([[?M, get_available_funs, 1]], L2),
              L3 = ?M:get_available_funs(<<"xprof_vm_info:get_available_funs/99">>),
              ?assertEqual([], L3)
      end}].
