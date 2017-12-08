-module(xprof_core_lib).

-export([mfaspec2atom/1,
         mfa2atom/1,
         mfaspec2id/1,
         now2epoch/1,
         set_mode/1,
         get_mode/0,
         get_mode_cb/0,
         prefix/2,
         prefix_rest/2,
         err/1, err/2, err/3,
         fmt_err/1, fmt_err/2, fmt_err/3
        ]).

-spec mfaspec2atom(xprof_core:mfa_spec()) -> xprof_core:mfa_name().
mfaspec2atom({MFAId, {_MSOff, _MSOn}}) ->
    mfa2atom(MFAId).

-spec mfa2atom(xprof_core:mfa_id()) -> xprof_core:mfa_name().
mfa2atom({M, F, '_'}) ->
    list_to_atom(string:join(["xprof_", atom_to_list(M),
                              atom_to_list(F), "_"], "_"));
mfa2atom({M,F,A}) ->
    list_to_atom(string:join(["xprof_", atom_to_list(M),
                              atom_to_list(F), integer_to_list(A)], "_")).

-spec mfaspec2id(xprof_core:mfa_spec()) -> xprof_core:mfa_id().
mfaspec2id({MFAId, {_, _}}) ->
    MFAId.

now2epoch({MS, S, _US}) ->
    MS * 1000000 + S.

-spec set_mode(xprof_core:mode()) -> ok.
set_mode(Mode) when Mode =:= elixir; Mode =:= erlang ->
    application:set_env(xprof_core, mode, Mode).

-spec get_mode() -> xprof_core:mode().
get_mode() ->
    case application:get_env(xprof_core, mode) of
        undefined ->
            Mode = detect_mode(),
            set_mode(Mode),
            Mode;
        {ok, Mode} ->
            Mode
    end.

-spec get_mode_cb() -> module().
get_mode_cb() ->
    case get_mode() of
        erlang -> xprof_core_erlang_syntax;
        elixir -> xprof_core_elixir_syntax
    end.

-spec detect_mode() -> xprof_core:mode().
detect_mode() ->
    case lists:keymember(elixir, 1, application:which_applications()) of
        true -> elixir;
        false -> erlang
    end.

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

%% @doc Throw an error in a common format
-spec err(string()) -> no_return().
err(Fmt) ->
    throw(fmt_err(Fmt)).

-spec err(string(), list()) -> no_return().
err(Fmt, Args) ->
    throw(fmt_err(Fmt, Args)).

-spec err(tuple() | integer(), module(), term()) -> no_return().
err(Loc, Mod, Err) ->
    throw(fmt_err(Loc, Mod, Err)).

%% @doc Return an error in a common format
-spec fmt_err(string()) -> no_return().
fmt_err(Fmt) ->
    {error, fmt(Fmt, [])}.

-spec fmt_err(string(), list()) -> no_return().
fmt_err(Fmt, Args) ->
    {error, fmt(Fmt, Args)}.

-spec fmt_err(tuple() | integer(), module(), term()) -> {error, string()}.
fmt_err({1, StartCol, _EndCol}, Mod, Err) ->
    fmt_err({1, StartCol}, Mod, Err);
fmt_err({1, Col}, Mod, Err) ->
    {error, fmt("~s at column ~p", [Mod:format_error(Err), Col])};
fmt_err(1, Mod, Err) ->
    {error, fmt(Mod:format_error(Err), [])}.

fmt(Fmt, Args) ->
    lists:flatten(io_lib:format(Fmt, Args)).
