%%% There are 3 types of cmds
%%% - tracing functions -> mfaspec present -> could use meta-tracing with trace_pattern
%%%   -> can be turned off by trace_pattern
%%%   - cmd id = mfaid
%%% - tracing send or receive -> no mfa, no meta-tracing, but can use trace_pattern (to match on message/sender/receiver)
%%%   -> can be turned off by trace_pattern
%%%   - cmd id = ??? (single tracer per cmd-name or trace tag)
%%% - other -> no trace_pattern -> xprof_core_tracer should find out where to send trace based on trace tag (maybe)
%%%   -> can only be turned off by trace/3
%%%   - cmd id = ??? (single tracer per cmd-name or trace tag)
-module(xprof_core_cmd).

-export([expand_query/1,
         process_query/2,
         process_cmd/2]).

%%
%% Callback functions that need to be implemented
%% for a command behvaiour
%%

%% Return list of mandatory params
-callback mandatory_params() -> [atom()].

%% Convert param value from syntax-tree format to Erlang term or expression
%% (Useful to implement some syntactic sugar/shorthands)
-callback param_from_ast(Key :: atom(), Ast :: erl_parse:syntax_tree()) ->
    {ok, Value :: term()} | {error, Reason :: term()}.

%% Validate param value and optionally convert to internal format
%% (Called for both params parsed from query string and provided directly as
%% additional params)
-callback param_to_internal(Key :: atom(), Value :: term()) ->
    {ok, NewValue :: term()} | {error, Reason :: term()}.

-record(cmd, {name, cb_mod, desc}).

process_query(Query, AdditionalParams) ->
    case xprof_core_query:parse_query(Query) of
        {error, _} = Error ->
            Error;
        {ok, Cmd, ParamsAst} ->
            try
                %% * lookup cmd callback
                CmdCB = get_cmd_callback(Cmd),

                %% * convert params from AST to term
                %% (FIXME could error on unknown params)
                {ok, QueryParams} = params_from_ast(Cmd, ParamsAst, CmdCB, []),

                %% * merge additional params
                %% - if additional params have precedence then it is possible to
                %%   modify the query from gui menu/buttons
                %% - if query params have precedence then we make sure what is
                %%   displayed in query string takes effect
                Params = merge_params(QueryParams, AdditionalParams),

                %% * check all mandatory params are present
                MandatoryParams = CmdCB:mandatory_params(),
                ok = check_mandatory_params(Params, MandatoryParams),

                %% * check param value types as much as possible
                %%   and maybe convert to internal format (eg mfaspec)
                {ok, Options} = params_to_internal(Cmd, Params, CmdCB, []),

                {start_cmd, Cmd, Options, CmdCB, Query}
            catch throw:{error, _} = Error ->
                    Error;
                  error:{badmatch, {error, _} = Error} ->
                    Error
            end
    end.

process_cmd(Cmd, Params) ->
    %% * lookup cmd callback
    CmdCB = get_cmd_callback(Cmd),

    %% * FIXME figure out some string represention to fake querystring
    %% (probably move to xprof_core_query:fmt_query(Cmd, Params)
    Query =
        case proplists:get_value(mfa, Params) of
            undefined ->
                <<"">>;
            MFAStr when is_list(MFAStr) ->
                list_to_binary(MFAStr);
            {Mod, Fun, Arity} ->
                ModeCb = xprof_core_lib:get_mode_cb(),
                _FormattedMFA = ModeCb:fmt_mfa(Mod, Fun, Arity)
        end,

    %% * check all mandatory params are present
    MandatoryParams = CmdCB:mandatory_params(),
    ok = check_mandatory_params(Params, MandatoryParams),

    %% * check param value types as much as possible
    %%   and maybe convert to internal format (eg mfaspec)
    {ok, Options} = params_to_internal(Cmd, Params, CmdCB, []),

    {start_cmd, Cmd, Options, CmdCB, Query}.

get_cmd_callback(funlatency) ->
    xprof_core_cmd_funlatency;
get_cmd_callback(argdist) ->
    xprof_core_cmd_argdist;
get_cmd_callback(Cmd) ->
    {error, {unknown_command, Cmd}}.

params_from_ast(Cmd, [{Key, Ast}|ParamsAst], CmdCB, Acc) ->
    case CmdCB:param_from_ast(Key, Ast) of
        {error, Reason} ->
            {error, {param_from_ast, Cmd, Key, Reason}};
        {ok, Value} ->
            params_from_ast(Cmd, ParamsAst, CmdCB, [{Key, Value}|Acc])
    end;
params_from_ast(_, [], _, Acc) ->
    {ok, lists:reverse(Acc)}.

params_to_internal(Cmd, [{Key, Value}|Params], CmdCB, Acc) ->
    case CmdCB:param_to_internal(Key, Value) of
        {error, Reason} ->
            {error, {param_to_internal, Cmd, Key, Reason}};
        {ok, InternalValue} ->
            params_to_internal(Cmd, Params, CmdCB, [{Key, InternalValue}|Acc])
    end;
params_to_internal(_, [], _, Acc) ->
    {ok, lists:reverse(Acc)}.

merge_params(P1, P2) ->
    lists:foldl(
      fun({Key, _} = Param, P) ->
              lists:keystore(Key, 1, P, Param)
      end, P2, P1).

check_mandatory_params(Params, MandatoryParams) ->
    [case lists:keymember(Key, 1, Params) of
         true -> ok;
         false -> xprof_core_lib:err("Mandatory param ~p missing", [Key])
     end
     || Key <- MandatoryParams],
    ok.

%% @doc Get expansion suggestions for the given possibly incomplete query.
-spec expand_query(binary()) -> {CommonPrefix :: binary(), [Match]}
                              | {error, Reason ::binary()}
                                    when
      Match :: {Prefix :: binary(), Label :: binary(), Hint :: binary()}
             | {Prefix :: binary(), Label :: binary()}.
expand_query(Query) ->
    Mode = xprof_core_lib:get_mode(),
    try
        Result =
            case {Mode, Query} of
                {erlang, <<"#", Q/binary>>} ->
                    expand_extended_query(Q);
                {elixir, <<"%", Q/binary>>} ->
                    expand_extended_query(Q);
                _ ->
                    expand_match_spec(Query)
            end,
        maybe_add_common_prefix(Result)
    catch throw:{error, _} = Error ->
            Error
    end.

expand_extended_query(Query) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    case ModeCb:parse_incomplete_query(unicode:characters_to_list(Query)) of
        {incomplete_cmd, CmdPrefix} ->
            _FilteredCmds = filter_cmds(unicode:characters_to_binary(CmdPrefix), ModeCb);
        {incomplete_key, KeyPrefix, Cmd, Params} when is_list(KeyPrefix) ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            MissingParams = missing_params(CmdInfo, Params),
            _FilteredParams = filter_params(unicode:characters_to_binary(KeyPrefix), MissingParams, ModeCb);
        {incomplete_key, {Key, RestStr}, Cmd, Params} when is_atom(Key) ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            MissingParams = missing_params(CmdInfo, Params),
            case lists:member(Key, MissingParams) of
                true ->
                    %% FIXME this is erlang specific - move it from here
                    case RestStr of
                        "" ->
                            [{<<"= ">>, atom_to_binary(Key, unicode)}];
                        "=" ->
                            [{<<" ">>, atom_to_binary(Key, unicode)}];
                        _ ->
                            xprof_core_lib:err("'=' expected after param name: ~p", [Key])
                    end;
                false ->
                    xprof_core_lib:err("unknown or duplicated param name: ~p", [Key])
            end;
        {incomplete_value, Key, ValuePrefix, Cmd, Params} ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            MissingParams = missing_params(CmdInfo, Params),
            case lists:member(Key, MissingParams) of
                true ->
                    case Key of
                        mfa ->
                            %% special case `mfa'

                            ValueBin = case ValuePrefix of
                                           {TokensSoFar, _RestStr} ->
                                               StartCol = column(hd(TokensSoFar)),
                                               ValueLen = byte_size(Query) - StartCol + 1,
                                               binary:part(Query, StartCol - 1, ValueLen);
                                           _ when is_list(ValuePrefix) ->
                                               unicode:characters_to_binary(ValuePrefix)
                                       end,
                            expand_match_spec(ValueBin);
                        _ ->
                            [{<<>>, atom_to_binary(Key, unicode)}]
                    end;
                false ->
                    xprof_core_lib:err("unknown or duplicated param name: ~p", [Key])
            end;
        {ok, Cmd, Params} ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            case lists:last(Params) of
                {mfa, _} ->
                    %% mfa must be the last param
                    [];
                _ ->
                    case missing_params(CmdInfo, Params) of
                        [] ->
                            [];
                        _ ->
                            {<<", ">>, []}
                    end

            end;
        {error, {unexpected, Token, _State}} ->
            xprof_core_lib:err("unexpected '~s' at column ~p", [text(Token), column(Token)])
    end.

expand_match_spec(Query) ->
    Funs = xprof_core_vm_info:get_available_funs(Query),
    _FilteredFuns = [{prefix_tail(Query, Fun), Fun} || Fun <- Funs].


%% erl_anno module and erl_scan:text was introduced in OTP 18.0
text(Token) ->
    %% erl_scan:text(Token).
    proplists:get_value(text, element(2, Token)).

column(Token) ->
    case element(2, Token) of
        {_Line, Col} ->
            Col;
        Anno when is_list(Anno) ->
            case {proplists:get_value(column, Anno),
                  proplists:get_value(location, Anno)} of
                {Col, undefined} when is_integer(Col) -> Col;
                {undefined, {_Line, Col}} -> Col;
                _ -> undefined
            end
    end.

missing_params(CmdInfo, Params) ->
    CmdCb = CmdInfo#cmd.cb_mod,
    AllParams = CmdCb:mandatory_params() ++ CmdCb:optional_params(),
    _MissingParams = [P || P <- AllParams,
                           not lists:keymember(P, 1, Params)].

filter_cmds(Prefix, ModeCb) ->
    [{<<Rest/binary, " ">>, CmdBin, Cmd#cmd.desc}
     || Cmd <- cmds(),
        begin
            CmdBin = ModeCb:fmt_mod(Cmd#cmd.name),
            Rest = xprof_core_lib:prefix_rest(Prefix, CmdBin),
            Rest =/= false
        end].

filter_params(KeyPrefix, MissingParams, ModeCb) ->
    %% FIXME '=' delimiter is erlang specific
    [{<<Rest/binary, " = ">>, PBin}
     || P <- MissingParams,
        begin
            PBin = ModeCb:fmt_mod(P),
            Rest = xprof_core_lib:prefix_rest(KeyPrefix, PBin),
            Rest =/= false
        end].


get_cmd_info_or_fail(Cmd) ->
    case lists:keyfind(Cmd, #cmd.name, cmds()) of
        false ->
            xprof_core_lib:err("unknown command: ~p", [Cmd]);
        CmdInfo ->
            CmdInfo
    end.

cmds() ->
    [#cmd{name = funlatency,
          cb_mod = xprof_core_cmd_funlatency,
          desc = <<"Measure latency of function calls">>},
     #cmd{name = argdist,
          cb_mod = xprof_core_cmd_argdist,
          desc = <<"Distribution of argument values">>},
     #cmd{name = funcount,
          cb_mod = xprof_core_cmd_funlatency,
          desc = <<"Test">>}
    ].

prefix_tail(Prefix, Bin) ->
    case xprof_core_lib:prefix_rest(Prefix, Bin) of
        false ->
            <<>>;
        Res ->
            Res
    end.

maybe_add_common_prefix(Matches) when is_list(Matches) ->
    CommonPrefix = common_match_prefix(Matches),
    {CommonPrefix, Matches}.

common_match_prefix(Matches) ->
    common_prefix([element(1, Match) || Match <- Matches]).

common_prefix([]) ->
    <<>>;
common_prefix([Item]) ->
    Item;
common_prefix([_,_|_] = List) ->
    SortedList = lists:sort(List),
    First = hd(SortedList),
    Last = lists:last(SortedList),
    Len = common_prefix_len(First, Last, 0),
    binary:part(First, 0, Len).

common_prefix_len(<<C, A/binary>>, <<C, B/binary>>, N) ->
    common_prefix_len(A, B, N+1);
common_prefix_len(_, _, N) ->
    N.
