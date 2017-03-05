-module(xprof_vm_info).

-export([get_available_funs/1]).

%% @doc Return list of existing module/funcion/arity that match query.
%%
%% If query does not contain colon only the global functions
%% (excluding module_info) of all the matching modules are listed.
%% If query contains colon both the global and local functions
%% (excluding generated local functions) are listed of that particular module
%% matching the query.

-spec get_available_funs(binary()) -> [MFA]
  when MFA :: list(). %% [module(), atom(), arity()]
get_available_funs(Query) ->
    AllMods = get_modules(),
    case find_mod(Query, AllMods) of
        [{Mod, FunPrefix}] ->
            Funs = get_all_functions(Mod),
            [[Mod, Fun, Arity]
             || {Fun, Arity} <- filter_funs(FunPrefix, Funs)];
        [] ->
            [[Mod, Fun, Arity]
             || Mod <- filter_mods(Query, AllMods),
                {Fun, Arity} <- get_global_functions(Mod)]
    end.

filter_funs(Prefix, Funs) ->
    lists:filter(fun({Fun, Arity}) ->
                         is_fun_arity(Prefix, Fun, Arity)
                             orelse is_ms_fun(Prefix, Fun)
                 end, Funs).

is_fun_arity(Prefix, Fun, Arity) ->
    FunArityBin = fmt_fun_and_arity(Fun, Arity),
    prefix(Prefix, FunArityBin).

%% @doc Check if Prefix string can be a match-spec fun declaration.
%% The heuristic is that the function name must be followed by an open
%% parenthesis or space character.
%% (Prefix is definitely longer than FunBin otherwise it would have been a
%%  prefix of FunArityBin already)
is_ms_fun(Prefix, Fun) ->
    FunBin = fmt_fun(Fun),
    case prefix_rest(FunBin, Prefix) of
        <<"(", _/binary>> -> true;
        <<" ", _/binary>> -> true;
        _ -> false
    end.

filter_mods(Prefix, Mods) ->
    lists:filter(fun(Mod) ->
                         prefix(Prefix, fmt_mod(Mod))
                 end, Mods).

find_mod(Query, Mods) ->
    lists:filtermap(
      fun(Mod) ->
              ModBin = fmt_mod_and_delim(Mod),
              case prefix_rest(ModBin, Query) of
                  false -> false;
                  Rest -> {true, {Mod, Rest}}
              end
      end, Mods).

-spec get_global_functions(module()) -> [{atom(), arity()}].
get_global_functions(Mod) ->
    [FA || FA = {F, _} <- Mod:module_info(exports), F =/= module_info].

-spec get_all_functions(module()) -> [{atom(), arity()}].
get_all_functions(Mod) ->
    %% filter out functions generated for fun objects
    %% and list comprehensions like '-filter_funs/2-fun-0-'
    [FA || FA = {F, _} <- Mod:module_info(functions), not lists:prefix("-", atom_to_list(F))].

get_modules() ->
    ModsFiles = code:all_loaded(),
    [ Mod || {Mod, _File} <- ModsFiles].

-spec prefix(binary(), binary()) -> boolean().
prefix(Prefix, Bin) ->
    PrefixSize = byte_size(Prefix),
    case Bin of
        <<Prefix:PrefixSize/binary, _/binary>> -> true;
        _ -> false
    end.

-spec prefix_rest(binary(), binary()) -> false | binary().
prefix_rest(Prefix, Bin) ->
    PrefixSize = byte_size(Prefix),
    case Bin of
        <<Prefix:PrefixSize/binary, Rest/binary>> -> Rest;
        _ -> false
    end.

%% Erlang specific
fmt_mod(Mod) ->
    fmt("~w", [Mod]).

fmt_mod_and_delim(Mod) ->
    fmt("~w:", [Mod]).

fmt_fun(Fun) ->
    fmt("~w", [Fun]).

fmt_fun_and_arity(Fun, Arity) ->
    fmt("~w/~b", [Fun, Arity]).

fmt(Fmt, Args) ->
    list_to_binary(io_lib:format(Fmt, Args)).
