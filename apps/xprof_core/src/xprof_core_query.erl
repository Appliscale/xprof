-module(xprof_core_query).

-export([param_to_term/1,
         param_to_fun/1,
         parse_query/1]).

param_to_term([ValueAst]) ->
    param_to_term(ValueAst);
param_to_term(ValueAst) when is_tuple(ValueAst) ->
    try {ok, erl_parse:normalise(ValueAst)}
    catch error:{badarg, NotATermAst} ->
            %% erl_pp:expr(NotATermAst, -1, 0)
            {error, {not_a_term, NotATermAst}}
    end.

-spec param_to_fun(erl_parse:abstract_expr()) -> {ok, fun()} | {error, string()}.
param_to_fun({'fun', _Loc, _Clauses} = ValueAst) ->
    try
        {value, Value, _} = erl_eval:expr(ValueAst, []),
        {ok, Value}
    catch
        error:Reason ->
            %% `check_command' is an undocumented wrapper around the linter,
            %% called by `erl_eval:expr' before doing the actual evaluation.
            %% In case of error we call it again because it returns a richer
            %% error with location info and also provides a module with
            %% formatter.
            case erl_eval:check_command([ValueAst], []) of
                {error, {Loc, Mod, Res}} ->
                    xprof_core_lib:fmt_err(Loc, Mod, Res);
                ok ->
                    %% The error did not come from the linter, but happend
                    %% during evaluation.
                    xprof_core_lib:fmt_err("~p", [Reason])
            end
    end.

-spec parse_query(binary()) -> {ok, xprof_core:cmd(),
                                [{mfa, string()} |
                                 {atom(), erl_parse:abstract_expr()}]}
                             | {error, Reason :: any()}.
parse_query(Query) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    ModeCb:parse_query(unicode:characters_to_list(Query)).
