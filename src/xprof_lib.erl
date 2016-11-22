-module(xprof_lib).

-export([mfa2atom/1, mfaspec2id/1, now2epoch/1]).

-spec mfa2atom(xprof_tracer:mfaspec() | xprof_tracer:mfaid()) ->
                      xprof_tracer:mfaname().
mfa2atom({M, F, {_MSOff, _MSOn}}) ->
    mfa2atom({M, F, '*'});
mfa2atom({M, F, '*'}) ->
    list_to_atom(string:join(["xprof_", atom_to_list(M),
                              atom_to_list(F), "*"], "_"));
mfa2atom({M,F,A}) ->
    list_to_atom(string:join(["xprof_", atom_to_list(M),
                              atom_to_list(F), integer_to_list(A)], "_")).


-spec mfaspec2id(xprof:mfaspec()) -> xprof:mfaid().
mfaspec2id({M, F, {_, _}})
  when is_atom(M), is_atom(F) ->
    {M, F, '*'};
mfaspec2id({M, F, A} = MFA)
  when is_atom(M), is_atom(F), is_integer(A) ->
    MFA.

now2epoch({MS, S, _US}) ->
    MS * 1000000 + S.
