%% Erlang specific
-module(xprof_erlang_syntax).

-export([normalise_query/1,
         hidden_function/1,
         fmt_mod_and_delim/1,
         fmt_mod/1,
         fmt_fun_and_arity/2,
         fmt_fun/1]).

normalise_query(Query) ->
    Query.

hidden_function(module_info) -> true;
hidden_function(Fun) ->
    case atom_to_list(Fun) of
        "-" ++ _ ->
            %% filter out local functions generated for fun objects
            %% and list comprehensions like '-filter_funs/2-fun-0-'
            true;
        _ -> false
    end.

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
