-module(xprof_core_vm_info_tests).

-include_lib("eunit/include/eunit.hrl").

-define(M, xprof_core_vm_info).

get_available_funs_test_() ->
    [fun() ->
             L1 = ?M:get_available_funs(<<"">>),
             L2 = ?M:get_available_funs(<<"x">>),
             ?assert(length(L1) > length(L2)),
             ?assertEqual([], L2 -- L1),
             ?assertNotEqual([], L1 -- L2)
     end,
     {"Only module names are listed",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info">>),
              ?assert(lists:member(<<"xprof_core_vm_info:">>, L1)),
              ?assertNot(lists:member(<<"xprof_core_vm_info:get_available_funs/1">>, L1))
      end},
     {"Module info is filtered out",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info:">>),
              ?assertNot(lists:member(<<"xprof_core_vm_info:module_info/0">>, L1)),
              ?assertNot(lists:member(<<"xprof_core_vm_info:module_info/1">>, L1))
      end},
     {"Local functions are also listed if query contains colon",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info:">>),
              ?assert(lists:member(<<"xprof_core_vm_info:get_available_funs/1">>, L1)),
              ?assert(lists:member(<<"xprof_core_vm_info:filter_funs/3">>, L1))
      end},
     {"Local functions are listed after exported ones",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info:">>),
              ?assertMatch([<<"xprof_core_vm_info:ensure_mfa/1">>|_], L1),
              ?assert(lists:member(<<"xprof_core_vm_info:filter_funs/3">>, L1))
      end},
     {"Generated functions are filtered out",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"xprof_core_vm_info:'-">>)),
              ?assertEqual([], ?M:get_available_funs(<<"gen_server:behaviour_info">>))
      end},
     {"No module matches query",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"zzz">>)),
              ?assertEqual([], ?M:get_available_funs(<<"zzz:">>)),
              ?assertEqual([], ?M:get_available_funs(<<"true:">>))
      end},
     {"No function matches query",
      fun() ->
              ?assertEqual([], ?M:get_available_funs(<<"xprof_core_vm_info:zzz">>))
      end},
     {"Arity matching",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info:get_available_funs/">>),
              ?assertEqual([<<"xprof_core_vm_info:get_available_funs/1">>], L1),
              L2 = ?M:get_available_funs(<<"xprof_core_vm_info:get_available_funs/1">>),
              ?assertEqual([<<"xprof_core_vm_info:get_available_funs/1">>], L2),
              L3 = ?M:get_available_funs(<<"xprof_core_vm_info:get_available_funs/99">>),
              ?assertEqual([], L3)
      end},
     {"Match-spec fun matching",
      fun() ->
              L1 = ?M:get_available_funs(<<"xprof_core_vm_info:get_available_funs(_) ->">>),
              ?assertEqual([<<"xprof_core_vm_info:get_available_funs/1">>], L1),
              L2 = ?M:get_available_funs(<<"xprof_core_vm_info:get_available_funs message(get_tcw())">>),
              ?assertEqual([<<"xprof_core_vm_info:get_available_funs/1">>], L2)
      end}
    ].

get_called_funs_test_() ->
    [{"Functions without calls return empty list",
     fun() ->
             ?assertEqual([], ?M:get_called_funs({?MODULE, get_called_funs_test_, 0}))
     end},
     {"Lists calls from simple functions in standard library",
     fun() ->
             ?assertEqual([{lists, reverse, 2}], ?M:get_called_funs({lists, reverse, 1}))
     end},
     {"Doesn't list anything for BIF functions (containing erlang:nif_error/1 call)",
     fun() ->
             ?assertEqual([], ?M:get_called_funs({lists, reverse, 2}))
     end},
     {"Doesn't list itself in case of recursive function",
      fun() ->
              ?assertEqual([], ?M:get_called_funs({lists, nth, 2}))
      end},
     {"Extract calls from loaded xprof modules",
     fun() ->
             code:load_file(xprof_core_lib),
             Calls = ?M:get_called_funs({xprof_core_lib, detect_mode, 0}),
             ?assertEqual(2, length(Calls)),
             ?assertEqual([{application, which_applications, 0}, {lists, keymember, 3}], Calls)
     end},
     {"Extract calls from xprof_core_vm_info:get_called_funs/1",
     fun() ->
             code:load_file(?M),
             Calls = ?M:get_called_funs({?M, get_called_funs, 1}),
             ExpectedCalls = [{beam_disasm,file,1},
                              {code,which,1},
                              {lists,filtermap,2},
                              {lists,flatten,1},
                              {lists,usort,1},
                              {xprof_core_lib,get_mode_cb,0}
                             ],
             ?assertEqual(length(ExpectedCalls), length(Calls)),
             ?assertEqual(ExpectedCalls, Calls)
     end},
     {"Returns empty list on erroneous query",
     fun() ->
             Calls = ?M:get_called_funs({not_existing, function_call, 5}),
             ?assertEqual(Calls, [])
     end}
    ].

get_available_funs_elixir_test_() ->
    Tests =
        [{"Only module names are listed",
          fun() ->
                  ?assertEqual(elixir, xprof_core_lib:get_mode()),
                  L1 = ?M:get_available_funs(<<"System">>),
                  ?assert(lists:member(<<"System.">>, L1)),
                  ?assertNot(lists:member(<<"System.cmd/3">>, L1))
          end},
         {"Module info is filtered out",
          fun() ->
                  ?assertEqual([], ?M:get_available_funs(<<"System.module_info/">>)),
                  ?assertEqual([], ?M:get_available_funs(<<"System.__info__">>))
          end},
         {"Local functions are also listed if query contains dot",
          fun() ->
                  L1 = ?M:get_available_funs(<<"System.">>),
                  ?assert(lists:member(<<"System.cmd/3">>, L1)),
                  ?assert(lists:member(<<"System.do_cmd/3">>, L1))
          end},
         {"Local functions are listed after exported ones",
          fun() ->
                  L1 = ?M:get_available_funs(<<"System.">>),
                  PosExp = 'Elixir.Enum':find_index(
                             L1, fun(E) -> E =:= <<"System.cmd/3">> end),
                  PosLoc = 'Elixir.Enum':find_index(
                             L1, fun(E) -> E =:= <<"System.do_cmd/3">> end),
                  ?assert(PosExp < PosLoc)
          end},
         {"Generated functions are filtered out",
          fun() ->
                  ?assertEqual([], ?M:get_available_funs(<<"System.\"-">>)),
                  {module, _} = code:ensure_loaded('Elixir.Macro'),
                  ?assertEqual([], ?M:get_available_funs(<<"Macro.\"MACRO-binary_ops\"">>)),
                  ?assertEqual([], ?M:get_available_funs(<<"GenServer.behaviour_info">>))
          end},
         {"Module with Elixir prefix",
          fun() ->
                  ?assertEqual([], ?M:get_available_funs(<<"Elix">>)),
                  ?assertEqual([], ?M:get_available_funs(<<"Elixir.">>)),
                  ?assertEqual([], ?M:get_available_funs(<<"Elixir.System">>)),
                  ?assertEqual([], ?M:get_available_funs(<<"Elixir.System.cwd/">>))
          end},
         {"Erlang module",
          fun() ->
                  L1 = ?M:get_available_funs(<<":xprof_core_vm_info">>),
                  ?assert(lists:member(<<":xprof_core_vm_info.">>, L1)),
                  L2 = ?M:get_available_funs(<<":xprof_core_vm_info.get_available_funs">>),
                  ?assertEqual([<<":xprof_core_vm_info.get_available_funs/1">>], L2)
          end},
         {"Invalid module alias",
          fun() ->
                  ?assertEqual([], ?M:get_available_funs(<<"xprof">>))
          end},
         {"Arity matching",
          fun() ->
                  L1 = ?M:get_available_funs(<<"System.cmd/">>),
                  ?assertEqual([<<"System.cmd/2">>, <<"System.cmd/3">>], L1),
                  L2 = ?M:get_available_funs(<<"System.cmd/3">>),
                  ?assertEqual([<<"System.cmd/3">>], L2),
                  L3 = ?M:get_available_funs(<<"System.cmd/99">>),
                  ?assertEqual([], L3)
          end},
         {"Match-spec fun matching",
          fun() ->
                  L1 = ?M:get_available_funs(<<"System.delete_env(_) ->">>),
                  ?assertEqual([<<"System.delete_env/1">>], L1),
                  L2 = ?M:get_available_funs(<<"System.delete_env _ -> message(get_tcw())">>),
                  ?assertEqual([<<"System.delete_env/1">>], L2)
          end}],
    xprof_core_test_lib:run_elixir_unit_tests(Tests).

weird_atoms_test_() ->
    {setup,
     fun load_weird_mod/0,
     fun code:purge/1,
     [
      {"Module name with special character",
       fun() ->
               L1 = ?M:get_available_funs(<<"'A.B">>),
               ?assertEqual([<<"'A.B.C':">>], L1),
               L2 = ?M:get_available_funs(<<"'A.B.C':">>),
               ?assertEqual([<<"'A.B.C':h/10">>,
                             <<"'A.B.C':'f?'/0">>,
                             <<"'A.B.C':'g\\'g'/0">>,
                             <<"'A.B.C':h/1">>
                            ], L2)
       end},
      {"Function name with special character",
       fun() ->
               L1 = ?M:get_available_funs(<<"'A.B.C':'f">>),
               ?assertEqual([<<"'A.B.C':'f?'/0">>], L1),
               L2 = ?M:get_available_funs(<<"'A.B.C':'g">>),
               ?assertEqual([<<"'A.B.C':'g\\'g'/0">>], L2)
       end},
      {"Multiple arity matches",
       fun() ->
               L1 = ?M:get_available_funs(<<"'A.B.C':h/1">>),
               ?assertEqual([<<"'A.B.C':h/10">>, <<"'A.B.C':h/1">>], L1)
       end}
     ]}.

load_weird_mod() ->
    %% h/10 calls the other local functions
    %% that would be eliminated by the compiler otherwise
    Str =
        "-module('A.B.C').\n"
        "-export([h/10]).\n"
        "'f?'() -> ok.\n"
        "'g\\'g'() -> ok.\n"
        "h(_1) -> ok.\n"
        "h(_1, _2, _3, _4, _5, _6, _7, _8, _9, _10) ->"
        " {'f?'(), 'g\\'g'(), h(1)}.\n",
    Forms = scan_and_parse(Str, {1,1}),
    {ok, Mod, Bin} = compile:forms(Forms, []),
    {module, Mod} = code:load_binary(Mod, [], Bin),
    Mod.

scan_and_parse("", _) -> [];
scan_and_parse(Str, StartLoc) ->
    {done, {ok, Tokens, EndLoc}, Rest} =
        erl_scan:tokens([], Str, StartLoc),
    {ok, Form} = erl_parse:parse_form(Tokens),
    [Form|scan_and_parse(Rest, EndLoc)].
