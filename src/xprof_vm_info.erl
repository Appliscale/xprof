-module(xprof_vm_info).

-export([get_available_funs/1]).

%% @doc Return list of existing module/funcion/arity that match query.
%%
%% If query does not contain colon only the global functions
%% (excluding module_info) of all the matching modules are listed.
%% If query contains colon both the global and local functions
%% (excluding generated local functions) are listed of that particular module
%% matching the query.

-spec get_available_funs(binary()) -> [MFA :: binary()].
get_available_funs(Query) ->
    ModeCB = xprof_lib:get_mode_cb(),

    AllMods = get_modules(),

    NormQuery = ModeCB:normalise_query(Query),

    %% find the module which is fully writen out in the query
    %% and return all its functions
    ExactMatch = find_mods(NormQuery, AllMods, ModeCB),
    ExactMods = [Mod||{Mod, _} <- ExactMatch],
    AllFuns =
        lists:flatmap(
          fun({Mod, FunPrefix}) ->
                  Funs = get_all_functions(Mod, ModeCB),
                  [ModeCB:fmt_mfa(Mod, Fun, Arity)
                   || {Fun, Arity} <- filter_funs(FunPrefix, Funs, ModeCB)]
          end, ExactMatch),

    %% find modules which query is a partial prefix of
    MatchingMods = filter_mods(NormQuery, AllMods, ModeCB),
    IncompleteMods =
        [ModeCB:fmt_mod_and_delim(Mod)
         || Mod <- MatchingMods -- ExactMods],

    AllFuns ++ IncompleteMods.


find_mods(Query, AllMods, ModeCB) ->
    lists:filtermap(
      fun(Mod) ->
              ModBin = ModeCB:fmt_mod_and_delim(Mod),
              case xprof_lib:prefix_rest(ModBin, Query) of
                  false -> false;
                  Rest -> {true, {Mod, Rest}}
              end
      end, AllMods).

filter_mods(Prefix, Mods, ModeCB) ->
    lists:filter(fun(Mod) ->
                         xprof_lib:prefix(Prefix, ModeCB:fmt_mod(Mod))
                 end, Mods).

filter_funs(Prefix, Funs, ModeCB) ->
    lists:filter(fun({Fun, Arity}) ->
                         is_fun_arity(Prefix, Fun, Arity, ModeCB)
                             orelse is_ms_fun(Prefix, Fun, ModeCB)
                 end, Funs).

is_fun_arity(Prefix, Fun, Arity, ModeCB) ->
    FunArityBin = ModeCB:fmt_fun_and_arity(Fun, Arity),
    xprof_lib:prefix(Prefix, FunArityBin).

%% @doc Check if Prefix string can be a match-spec fun declaration.
%% The heuristic is that the function name must be followed by an open
%% parenthesis or space character.
%% (Prefix is definitely longer than FunBin otherwise it would have been a
%%  prefix of FunArityBin already)
is_ms_fun(Prefix, Fun, ModeCB) ->
    FunBin = ModeCB:fmt_fun(Fun),
    case xprof_lib:prefix_rest(FunBin, Prefix) of
        <<"(", _/binary>> -> true;
        <<" ", _/binary>> -> true;
        _ -> false
    end.

-spec get_all_functions(module(), module()) -> [{atom(), arity()}].
get_all_functions(Mod, ModeCB) ->
    [FA || FA = {F, _} <- Mod:module_info(functions),
           not ModeCB:hidden_function(F)].

get_modules() ->
    ModsFiles = code:all_loaded(),
    [ Mod || {Mod, _File} <- ModsFiles].
