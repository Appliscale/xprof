-module(xprof_lib).

-export([mfa2atom/1, now2epoch/1]).

mfa2atom({M,F,A}) ->
    list_to_atom(string:join(["xprof_", atom_to_list(M),
                              atom_to_list(F), integer_to_list(A)], "_")).

now2epoch({MS, S, _US}) ->
    MS * 1000000 + S.
