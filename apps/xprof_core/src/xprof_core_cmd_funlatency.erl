-module(xprof_core_cmd_funlatency).

-export([mandatory_params/0,
         convert_param/2,
         check_param/2
        ]).

mandatory_params() ->
    [mfa].

convert_param(mfa, MfaStr) when is_list(MfaStr) ->
    xprof_core_ms:fun2ms(MfaStr);
convert_param(mfa, _WrongValue) ->
    {error, wrong_value};
convert_param(retmatch, RetMatchAst) ->
    case RetMatchAst of
        {'fun', _Loc, _Clauses} ->
            xprof_core_query:param_to_fun(RetMatchAst);
        Pattern ->
            Loc = element(2, Pattern),
            %% fun(Pattern) -> true;(_) -> false
            Fun = {'fun', Loc,
                   {clauses,
                    [{clause, Loc, [Pattern], [], [{atom, Loc, true}]},
                     {clause, Loc, [{var, Loc, '_'}], [], [{atom, Loc, false}]}
                    ]}},
            xprof_core_query:param_to_fun(Fun)
    end;
convert_param(_, _) ->
    {error, unknown_param}.

check_param(mfa, _MfaSpec) ->
    ok;
check_param(retmatch, Fun) ->
    case erlang:fun_info(Fun, arity) of
        1 -> ok;
        2 -> ok;
        _ -> {error, wrong_arity}
    end;
check_param(_, _) ->
    {error, unknown_param}.










