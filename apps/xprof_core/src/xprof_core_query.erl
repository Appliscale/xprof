-module(xprof_core_query).

-export([param_to_term/1,
         param_to_fun/1,
         parse_query/1]).

param_to_term(ValueAst) ->
    case erl_parse:parse_term([ValueAst, {dot, {2, 1}}]) of
        {error, {ErrLoc, Mod, Err}} ->
            xprof_core_lib:fmt_err(ErrLoc, Mod, Err);
        {ok, Value} ->
            {ok, Value}
    end.

param_to_fun({'fun', _Loc, _Clauses} = ValueAst) ->
    try
        {value, Value, _} = erl_eval:expr(ValueAst, []),
        {ok, Value}
    catch
        error:Reason ->
            {error, Reason}
    end.

parse_query(Query) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    ModeCb:parse_query(Query).
