-module(xprof_lib).

-export([mfa2atom/1,
         mfaspec2id/1,
         now2epoch/1,
         set_mode/1,
         get_mode/0
        ]).

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

-spec set_mode(xprof:mode()) -> ok.
set_mode(Mode) when Mode =:= elixir; Mode =:= erlang ->
    application:set_env(xprof, mode, Mode).

-spec get_mode() -> xprof:mode().
get_mode() ->
    case application:get_env(xprof, mode) of
        undefined ->
            Mode = detect_mode(),
            set_mode(Mode),
            Mode;
        {ok, Mode} ->
            Mode
    end.

-spec detect_mode() -> xprof:mode().
detect_mode() ->
    case lists:keymember(elixir, 1, application:which_applications()) of
        true -> elixir;
        false -> erlang
    end.
