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
         process_cmd/2,
         prepare_start/1]).

%%
%% Callback functions that need to be implemented
%% for a command behaviour
%%

%% Return list of mandatory params
-callback mandatory_params() -> [atom()].

%% Return list of optional params
-callback optional_params() -> [atom()].

%% Convert param value from syntax-tree format to Erlang term or expression
%% (Useful to implement some syntactic sugar/shorthands)
-callback param_from_ast(Key :: atom(), Ast :: erl_parse:syntax_tree()) ->
    {ok, Value :: term()} | {error, Reason :: term()}.

%% Validate param value and optionally convert to internal format
%% (Called for both params parsed from query string and provided directly as
%% additional params)
-callback param_to_internal(Key :: atom(), Value :: term()) ->
    {ok, NewValue :: term()} | {error, Reason :: term()}.

%% Any preparation or check needed before starting the command
%% Executed in the process calling xprof_core
-callback prepare_start(xprof_core:options()) ->
    ok | {error, Reason :: term()}.

%% Pretty print error terms returned by one of the other callbacks
-callback format_error(term()) -> string().

%% Generate unique id from command options
%% There can be only one trace handler per command id
%% (In the future this will be an opaque type, but today it is an MFA)
-callback get_cmd_id(xprof_core:options()) -> xprof_core:mfa_id().

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
            catch throw:{error, Reason} ->
                    format_error(Reason);
                  error:{badmatch, {error, Reason}} ->
                    format_error(Reason)
            end
    end.

process_cmd(Cmd, Params) ->
    try
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

        {start_cmd, Cmd, Options, CmdCB, Query}
    catch throw:{error, Reason} ->
            format_error(Reason);
          error:{badmatch, {error, Reason}} ->
            format_error(Reason)
    end.

get_cmd_callback(funlatency) ->
    xprof_core_cmd_funlatency;
get_cmd_callback(argdist) ->
    xprof_core_cmd_argdist;
get_cmd_callback(Cmd) ->
    throw({error, {unknown_command, Cmd}}).

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
         false -> xprof_core_lib:err("Mandatory parameter ~p missing", [Key])
     end
     || Key <- MandatoryParams],
    ok.

-spec format_error(any()) -> {error, string()}.
format_error({unknown_command, Cmd}) ->
    xprof_core_lib:fmt_err("Unknown command ~p", [Cmd]);
format_error({Where, Cmd, Key, unknown_param})
  when Where =:= param_from_ast;
       Where =:= param_to_internal ->
    xprof_core_lib:fmt_err("~p is not a valid parameter of command ~p",
                           [Key, Cmd]);
format_error({Where, _Cmd, Key, wrong_value})
  when Where =:= param_from_ast;
       Where =:= param_to_internal ->
    xprof_core_lib:fmt_err("Parameter ~p has wrong value type", [Key]);
format_error({param_to_internal, Cmd, Key, Reason}) ->
    CmdCB = get_cmd_callback(Cmd),
    xprof_core_lib:fmt_err("Error converting parameter ~p to internal format: ~s",
                           [Key, CmdCB:format_error(Reason)]);
format_error({param_from_ast, Cmd, Key, Reason}) ->
    CmdCB = get_cmd_callback(Cmd),
    xprof_core_lib:fmt_err("Error converting parameter ~p to internal format: ~s",
                           [Key, CmdCB:format_error(Reason)]);
format_error(Reason) ->
    case io_lib:deep_char_list(Reason) of
        true ->
            {error, Reason};
        false ->
            xprof_core_lib:fmt_err("Unexpected error handling query: ~p", [Reason])
    end.

prepare_start({start_cmd, _Cmd, Options, CmdCB, _Query}) ->
    CmdCB:prepare_start(Options).

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
                    %% FIXME this is erlang/elixir specific - move it from here
                    case RestStr of
                        "" ->
                            [{<<"= ">>, ModeCb:fmt_param(Key)}];
                        "=" ->
                            [{<<" ">>, ModeCb:fmt_param(Key)}];
                        ":" ->
                            [{<<" ">>, ModeCb:fmt_param(Key)}];
                        _ ->
                            xprof_core_lib:err("'='/':' expected after param name: ~s",
                                               [ModeCb:fmt_param(Key)])
                    end;
                false ->
                    xprof_core_lib:err("unknown or duplicated param name: ~s",
                                       [ModeCb:fmt_param(Key)])
            end;
        {incomplete_value, Key, ValuePrefix, Cmd, Params} ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            MissingParams = missing_params(CmdInfo, Params),
            case lists:member(Key, MissingParams) of
                true ->
                    case Key of
                        mfa ->
                            %% special case `mfa'
                            ValueBin = unicode:characters_to_binary(ValuePrefix),
                            expand_match_spec(ValueBin);
                        _ ->
                            [{<<>>, ModeCb:fmt_param(Key)}]
                    end;
                false ->
                    xprof_core_lib:err("unknown or duplicated param name: ~p",
                                       [ModeCb:fmt_param(Key)])
            end;
        {ok, Cmd, _Params = []} ->
            CmdInfo = get_cmd_info_or_fail(Cmd),
            MissingParams = missing_params(CmdInfo, []),
            _FilteredParams = filter_params(<<>>, MissingParams, ModeCb);
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
        {error, Reason} ->
            xprof_core_lib:err(Reason)
    end.

expand_match_spec(Query) ->
    Funs = xprof_core_vm_info:get_available_funs(Query),
    _FilteredFuns = [{prefix_tail(Query, Fun), Fun} || Fun <- Funs].

missing_params(CmdInfo, Params) ->
    CmdCb = CmdInfo#cmd.cb_mod,
    AllParams = CmdCb:mandatory_params() ++ CmdCb:optional_params(),
    _MissingParams = [P || P <- AllParams,
                           not lists:keymember(P, 1, Params)].

filter_cmds(Prefix, ModeCb) ->
    [{<<Rest/binary, " ">>, CmdBin, Cmd#cmd.desc}
     || Cmd <- cmds(),
        begin
            CmdBin = ModeCb:fmt_cmd(Cmd#cmd.name),
            Rest = xprof_core_lib:prefix_rest(Prefix, CmdBin),
            Rest =/= false
        end].

filter_params(KeyPrefix, MissingParams, ModeCb) ->
    [{Rest, ModeCb:fmt_param(P)}
     || P <- MissingParams,
        begin
            PBin = ModeCb:fmt_param_and_delim(P),
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
          desc = <<"Distribution of argument values">>}
    ].

prefix_tail(Prefix, Bin) ->
    case xprof_core_lib:prefix_rest(Prefix, Bin) of
        false ->
            <<>>;
        Res ->
            Res
    end.

maybe_add_common_prefix(AlreadyAdded = {_CommonPrefix, _Matches}) ->
    AlreadyAdded;
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
