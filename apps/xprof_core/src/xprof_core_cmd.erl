-module(xprof_core_cmd).

-export([expand_query/1,
         handle_query/1,
         handle_query/2,
         run/2]).

%%
%% Callback functions that need to be implemented
%% for a command behvaiour
%%

%% Convert param value from syntax-tree format to Erlang term
%% (Useful to implement some syntactic sugar/shorthands)
-callback convert_param(Key :: atom(), Ast :: erl_parse:syntax_tree()) ->
    {ok, Value :: term()} | {error, Reason :: term()}.

%% Validate param value
%% (Called for both params parsed from query string and provided directly as
%% additional params)
-callback check_param(Key :: atom(), Value :: term()) ->
    ok | {error, Reason :: term()}.

handle_query(Query) ->
    handle_query(Query, []).

handle_query(Query, AdditionalParams) ->
    case xprof_core_query:parse_query(Query) of
        {error, _} = Error ->
            Error;
        {ok, Cmd, ParamsAst} ->
            %% * lookup cmd callback
            CmdCB = get_cmd_callback(Cmd),

            %% * convert params from AST to term
            %% (could error on unknown params)
            {ok, QueryParams} = convert_params(Cmd, ParamsAst, CmdCB, []),

            %% * merge additional params
            %% - if additional params have precedence then it is possible to
            %%   modify the query from gui menu/buttons
            %% - if query params have precedence then we make sure what is
            %%   displayed in query string takes effect
            Params = merge_params(QueryParams, AdditionalParams),

            %% * check for missing mandatory params and
            %% check param value types as much as possible
            ok = check_params(Cmd, Params, CmdCB, []),

            %% * maybe convert to internal format (eg mfaspec)

            %% * execute command
            xprof_core_tracer:start_cmd(Cmd, Params, CmdCB, Query)
    end.

run(Cmd, Params) ->
    %% * lookup cmd callback
    CmdCB = get_cmd_callback(Cmd),

    %% * check for missing mandatory params and
    %% check param value types as much as possible
    ok = check_params(Cmd, Params, CmdCB, []),

    %% * figure out some string represention to fake querystring
    Query = <<"">>,

    %% * execute command
    xprof_core_tracer:start_cmd(Cmd, Params, CmdCB, Query).

get_cmd_callback(funlatency) ->
    xprof_core_cmd_funlatency;
get_cmd_callback(Cmd) ->
    {error, {unknown_command, Cmd}}.

convert_params(Cmd, [{Key, Ast}|ParamsAst], CmdCB, Acc) ->
    case CmdCB:convert_param(Key, Ast) of
        {error, Reason} ->
            {error, {convert_param, Cmd, Key, Reason}};
        {ok, Value} ->
            case CmdCB:check_param(Key, Value) of
                {error, Reason} ->
                    {error, {convert_param, Cmd, Key, Reason}};
                ok ->
                    convert_params(Cmd, ParamsAst, CmdCB, [{Key, Value}|Acc])
            end
    end;
convert_params(_, [], _, Acc) ->
    {ok, lists:reverse(Acc)}.

check_params(Cmd, [{Key, Value}|Params], CmdCB, Acc) ->
    case CmdCB:check_param(Key, Value) of
        {error, Reason} ->
            {error, {check_param, Cmd, Key, Reason}};
        ok ->
            convert_params(Cmd, Params, CmdCB, [{Key, Value}|Acc])
    end;
check_params(_, [], _, Acc) ->
    {ok, lists:reverse(Acc)}.

merge_params(P1, P2) ->
    lists:foldl(
      fun({Key, _} = Param, P) ->
              lists:keystore(Key, 1, P, Param)
      end, P2, P1).

%% @doc Get expansion suggestions for the given possibly incomplete query.
-spec expand_query(binary()) -> {CommonPrefix :: binary(), [Match]}
                              | {error, Reason ::binary()}
                                    when
      Match :: {Prefix :: binary(), Label :: binary(), Hint :: binary()}
             | {Prefix :: binary(), Label :: binary()}.
expand_query(Query) ->
    try
        Result = expand_match_spec(Query),
        maybe_add_common_prefix(Result)
    catch throw:{error, _} = Error ->
            Error
    end.

expand_match_spec(Query) ->
    Funs = xprof_core_vm_info:get_available_funs(Query),
    _FilteredFuns = [{prefix_tail(Query, Fun), Fun} || Fun <- Funs].

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
