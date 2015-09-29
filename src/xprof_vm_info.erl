-module(xprof_vm_info).

-export([get_available_funs/1]).

get_available_funs(Query) ->
    Funs = get_available_funs(),
    lists:filter(fun([Mod,Fun,Arity]) ->
                         Str = io_lib:format("~w:~w/~b",[Mod,Fun,Arity]),
                         case re:run(Str, <<"^",Query/binary>>) of
                             nomatch -> false;
                             _ -> true
                         end
                 end, Funs).

get_available_funs() ->
    lists:foldl(fun(Mod, Acc) ->
                        Acc ++ get_mod_functions(Mod)
                end, [],get_modules()).

get_mod_functions(Mod) ->
    Funs = Mod:module_info(exports),
    [[Mod, Fun, Arity] || {Fun, Arity} <- Funs].

get_modules() ->
    ModsFiles = code:all_loaded(),
    [ Mod || {Mod, _File} <- ModsFiles].
