%%%
%%% @doc Module to parse and format expressions in Elixir syntax
%%%
-module(xprof_core_elixir_syntax).

-behaviour(xprof_core_language).

-export([parse_query/1,
         pretty_err/1,
         parse_incomplete_query/1,
         parse_match_spec/1,
         hidden_function/1,
         fmt_mfa/3,
         fmt_mod_and_delim/1,
         fmt_mod/1,
         fmt_fun_and_arity/2,
         fmt_fun/1,
         fmt_cmd/1,
         fmt_param/1,
         fmt_param_and_delim/1,
         fmt_exception/2,
         fmt_term/1]).

%% from elixir.hrl
-define(is_upcase(S), (S >= $A andalso S =< $Z)).

%% Elixir quoted expressions
-type ex_quoted() :: tuple() | ex_literal().
-type ex_literal() :: atom() | number() | binary() | fun((...) -> any()) | {any(), any()} | [any()].
%% Erlang abstract syntax tree
-type erl_ast() :: tuple().

%% @doc Parse a query string that represents either an xprof-flavoured
%% match-spec fun or an extended xprof query in Elixir syntax.
parse_query("%" ++ Query) ->
    %% extended query
    try
       Tokens = tokens_query(Query, error),
       case parse_query_tokens(Tokens, cmd, undefined, [], _Rest = false) of
           {ok, Cmd, Params} ->
               {ok, Cmd, mfa_to_str(Params, Query)};
           {more, What, _Cmd, _Params} ->
               case What of
                   cmd ->
                       xprof_core_lib:fmt_err("Missing command name", []);
                   key ->
                       xprof_core_lib:fmt_err("Expected parameter name missing at the end of the query", []);
                   {eq, _KeyT, Key} ->
                       xprof_core_lib:fmt_err("Missing : and value for parameter ~s", [fmt_term(Key)]);
                   {value, Key} ->
                       xprof_core_lib:fmt_err("Missing value for parameter ~s", [fmt_param(Key)]);
                   {value, Key, _Value} ->
                       xprof_core_lib:fmt_err("Incomplete value for parameter ~s", [fmt_param(Key)])
               end;
           {unexpected, Token, _State} ->
               fmt_unexp_token_err(Token)
       end
    catch
        throw:Error ->
            Error
    end;
parse_query(Query) ->
    {ok, funlatency, [{mfa, Query}]}.

-spec parse_incomplete_query(string()) ->
    {ok, Cmd, Params}
  | {incomplete_cmd, CmdPrefix}
  | {incomplete_key, KeyPrefix, Cmd, ParamsSoFar}
  | {incomplete_value, Key, ValuePrefix, Cmd, ParamsSoFar}
  | {error, Reason :: any()}
  when
      Cmd :: xprof_core:cmd(),
      CmdPrefix :: string(),
      Params :: xprof_core:params(),
      ParamsSoFar :: xprof_core:params(),
      Key :: atom(),
      KeyPrefix :: string(),
      ValuePrefix :: string().
%% throw:{error, Reason :: term()}
parse_incomplete_query(Query) ->
    {ok, Tokens, Rest} = tokens_query(Query, incomplete),
    case parse_query_tokens(Tokens, cmd, undefined, [], Rest =/= "") of
        {ok, Cmd, Params} = OK when Rest =:= "" ->
            %% Simulate behaviour of the Erlang parser, where a term is only
            %% complete if it is followed by a whitespace.
            %%
            %% If the query does not end with a space we pretend that the
            %% previous object (the command name or a parameter value) is still
            %% incomplete. Except for the value of `mfa' which is always
            %% incomplete, even if it ends with a space.
            LastParam = (Params =/= [] andalso lists:last(Params)),
            LastChar = lists:last(Query),
            case LastParam of
                {mfa, Loc} ->
                    %% Special case for mfa - always incomplete
                    %% value is start/end columns
                    MFAQuery = rest_from_query(Loc, Query),
                    {incomplete_value, mfa, MFAQuery, Cmd, lists:droplast(Params)};
                _ when $\s =:= LastChar ->
                    %% Query ends with space so previous object is complete
                    OK;
                {Key, _ValueAST} ->
                    %% Value of last param is incomplete
                    %%
                    %% Value AST has no meta/column info (it's converted from
                    %% Elixir quoted expression) so we cannot easily restore the
                    %% string representation of it. But this is not a problem
                    %% for now because the value-prefix is only used for
                    %% autocomplete in case of mfa key.
                    ValuePrefix = "",
                    {incomplete_value, Key, ValuePrefix, Cmd, lists:droplast(Params)};
                false ->
                    %% No params yet
                    {incomplete_cmd, Query}
            end;
        {more, cmd, _, _} ->
            {incomplete_cmd, Rest};
        {more, key, Cmd, Params} ->
            {incomplete_key, Rest, Cmd, Params};
        {more, {eq, KeyT, _Key}, Cmd, Params} when Rest =:= "" ->
            KeyPrefix = rest_from_tokens([KeyT], Query),
            {incomplete_key, KeyPrefix, Cmd, Params};
        {more, {eq, _, Key}, Cmd, Params} ->
            {incomplete_key, {Key, Rest}, Cmd, Params};
        {more, {value, Key, ValueTokens}, Cmd, Params} ->
            ValueRest = rest_from_tokens(ValueTokens, Query),
            {incomplete_value, Key, ValueRest, Cmd, Params};
        {more, {value, Key}, Cmd, Params} ->
            {incomplete_value, Key, Rest, Cmd, Params};
        {unexpected, Token, _State} ->
            fmt_unexp_token_err(Token)
    end.


tokens_query(Str, error) ->
    tokenizer_err(Str, 2);
tokens_query(Str, incomplete) ->
    case tokenizer(Str, 2) of
        {ok, Tokens} ->
            {ok, Tokens, ""};
        {error, {"unexpected token: ", [$\", ":", $\"|_],
                 _Rest = "", SoFar = [{identifier, _, _}|_]}} ->
            %% A kw_identinfier is only complete if the colon is followed by
            %% a space.
            %% In this case the space is yet missing from the end.
            Rest = ":",
            {ok, lists:reverse(SoFar), Rest};
        {error, {_Error, _TokenHint, Rest, SoFar}} ->
            {ok, lists:reverse(SoFar), Rest}
    end.

parse_query_tokens([{identifier, _, Cmd}|T], cmd, _C, _P, MoreStr) ->
    parse_query_tokens(T, key, Cmd, [], MoreStr);
parse_query_tokens([{alias, _, CmdAlias}|T], cmd, _C, _P, MoreStr) ->
    Cmd = alias_to_cmd_atom(CmdAlias),
    parse_query_tokens(T, key, Cmd, [], MoreStr);
parse_query_tokens([{aliases, Loc, [CmdAlias]}|T], cmd, _C, _P, MoreStr) ->
    %% FIXME aliases were tokenized differently before Elixir 1.6
    parse_query_tokens([{alias, Loc, CmdAlias}|T], cmd, _C, _P, MoreStr);
parse_query_tokens([{kw_identifier, _, Key}|T], key, Cmd, Params, MoreStr) ->
    parse_query_tokens(T, {value, Key}, Cmd, Params, MoreStr);
parse_query_tokens([{identifier, _, Key} = KeyT], key, Cmd, Params, _MoreStr) ->
    {more, {eq, KeyT, Key}, Cmd, Params};
parse_query_tokens([_|_] = T, {value, Key}, Cmd, Params, MoreStr) ->
    case parse_value(T, []) of
        {ok, _ValueAst, []} when MoreStr =:= true ->
            %% There is non-empty trailing string that cannot be scanned yet.
            %% If it would start with a comma that would be scannable,
            %% so it does not start with a comma.
            %% Hence we need to assume that it still belongs to the current value
            {more, {value, Key, T}, Cmd, Params};
        {ok, _ValueAst, TRest} when Key =:= mfa ->
            %% spec handling of `mfa' - store start and end column
            StartColumn = start_column(T),
            EndColumn = start_column(TRest),
            parse_query_tokens(TRest, comma, Cmd, [{Key, {StartColumn, EndColumn}}|Params], MoreStr);
        {ok, ValueAst, TRest} when is_tuple(ValueAst) ->
            parse_query_tokens(TRest, comma, Cmd, [{Key, ValueAst}|Params], MoreStr);
        _Error when Key =:= mfa, MoreStr =:= false ->
            %% spec handling of `mfa' - store start and end column
            Loc = {start_column(T), eof},
            {ok, Cmd, lists:reverse(Params, [{mfa, Loc}])};
        _Error ->
            {more, {value, Key, T}, Cmd, Params}
    end;
parse_query_tokens([{',', _}|T], comma, Cmd, Params, MoreStr) ->
    parse_query_tokens(T, key, Cmd, Params, MoreStr);
parse_query_tokens([], comma, Cmd, Params, _MoreStr = false) ->
    {ok, Cmd, lists:reverse(Params)};
parse_query_tokens([], _State = key, Cmd, _Params = [], _MoreStr = false) ->
    %% single command without parameters
    {ok, Cmd, []};
parse_query_tokens([], State, Cmd, Params, _MoreStr) ->
    {more, State, Cmd, Params};
parse_query_tokens([H|_], State, _, _, _) ->
    {unexpected, H, State}.

parse_value([_|_] = T, Head) ->
    {TH, TT} = tokens_to_comma(T),
    case {do_parse_tokens(Head ++ TH), TT} of
        {{error, _} = Error, []} ->
            Error;
        {{error, _} = Error, [{',', _}]} ->
            Error;
        {{error, _}, [{',', _} = Comma|TTT]} ->
            parse_value(TTT, Head ++ TH ++ [Comma]);
        {{ok, AST}, _} ->
            {ok, AST, TT}
    end.

tokens_to_comma(Tokens) ->
    lists:splitwith(
      fun(Token) -> element(1, Token) =/= ',' end,
      Tokens).

mfa_to_str([{mfa, Loc}|Params], OrigQuery) ->
    MFAQuery = rest_from_query(Loc, OrigQuery),
    [{mfa, MFAQuery}|Params];
mfa_to_str([KeyValue|Params], OrigQuery) ->
    [KeyValue|mfa_to_str(Params, OrigQuery)];
mfa_to_str([], _) ->
    [].

rest_from_tokens(Tokens, OrigQuery) ->
    rest_from_query({start_column(Tokens), eof}, OrigQuery).

rest_from_query({StartColumn, eof}, OrigQuery) ->
    rest_from_query({StartColumn, length(OrigQuery) + 2}, OrigQuery);
rest_from_query({StartColumn, EndColumn}, OrigQuery) ->
    %% OrigQuery does not contain leading `#'/`%'
    %% so it starts at column 2
    Len = EndColumn - StartColumn,
    _RestStr = lists:sublist(OrigQuery, StartColumn - 1, Len).

fmt_unexp_token_err(Token) ->
    {Type, Value} = case Token of
                        {V, _Meta} -> {token, V};
                        {T, _Meta, V} -> {T, V}
                    end,
    xprof_core_lib:fmt_err("unexpected ~w ~p at column ~p",
                           [Type, Value, column(Token)]).

start_column([]) ->
    eof;
start_column([FirstToken|_]) ->
    column(FirstToken).

column(Token) ->
    case element(2, Token) of
        {_Line, {StartColumn, _EndColumn}, _Meta} ->
            StartColumn;
        {_Line, StartColumn, _EndColumn} ->
            %% FIXME old token Location format before Elixir 1.6.0
            StartColumn
    end.

%% @doc Parse a query string that represents either a module-funtion-arity
%% or an xprof-flavoured match-spec fun in Elixir syntax.
%% In the later case the last element of the tuple is the abstract syntax tree
%% of the clauses of the anonimous function.
parse_match_spec(Str) ->
    case 'Elixir.Code':string_to_quoted("(" ++ Str ++ ")") of
        {ok, Quoted} ->
            parse_quoted(Quoted);
        {error, _} ->
            pretty_err(Str)
    end.

%% matchers
-define(dot(Mod, Fun),
        {'.', _, [Mod, Fun]}).
-define(mfargs(Mod, Fun, Args),
        {?dot(Mod, Fun), _, Args}).
-define(guard(ArgsAndGuards),
        {'when', _, ArgsAndGuards}).
-define(clause(Args, Body),
        {'->', _, [Args, Body]}).
-define(clause(Args, Guards, Body),
        {'->', _, [[?guard(Args ++ [Guards])], Body]}).

%% builders
-define(meta, [{line, 1}]).

build_guard(ArgsAndGuards) ->
    {'when', ?meta, ArgsAndGuards}.
build_clause(Args, Body) ->
    {'->', ?meta, [Args, Body]}.
build_clause(Args, Guards, Body) ->
    {'->', ?meta, [[build_guard(Args ++ [Guards])], Body]}.
build_fn(Clauses) ->
    {'fn', ?meta, Clauses}.

%% @doc Match various supported query syntaxes in the quoted expression
%% Note: as Elixir supports ommitting parens the below are always equivalent
%% "Mod.fun Args" => "Mod.fun(Args)"
%% "Mod.fun" => "Mod.fun()"
-spec parse_quoted(ex_quoted())
    -> {mfa, mfa()}
     | {clauses, module(), atom(), [erl_parse:abstract_clause()]}.
%% Mod.fun/Arity
parse_quoted({'/', _, [?mfargs(ModQ, Fun, []), Arity]})
  when is_atom(Fun), is_integer(Arity) ->
    Mod = mod_to_atom(ModQ),
    {mfa, {Mod, Fun, Arity}};
%% "Mod.fun(Args)"
parse_quoted(?mfargs(ModQ, Fun, Args)) when is_atom(Fun) ->
    Mod = mod_to_atom(ModQ),
    Clauses = fn_to_clauses(build_fn([build_clause(Args, true)])),
    {clauses, Mod, Fun, Clauses};
%% "Mod.fun(Args) when Gaurds"
parse_quoted(?guard([?mfargs(ModQ, Fun, Args), Guards]))
 when is_atom(Fun), is_list(Args) ->
    Mod = mod_to_atom(ModQ),
    Clauses = fn_to_clauses(build_fn([build_clause(Args, Guards, true)])),
    {clauses, Mod, Fun, Clauses};
%% "Mod.fun(Args) -> Body"
parse_quoted([?clause([?mfargs(ModQ, Fun, Args)], Body)|ClausesQ])
 when is_atom(Fun), is_list(Args) ->
    Mod = mod_to_atom(ModQ),
    ClausesAST = fn_to_clauses(build_fn([build_clause(Args, Body)|ClausesQ])),
    {clauses, Mod, Fun, ClausesAST};
%% "Mod.fun(Args) when Guards -> Body"
parse_quoted([?clause([?guard([?mfargs(ModQ, Fun, Args), Guards])], Body)|ClausesQ])
  when is_atom(Fun), is_list(Args) ->
    Mod = mod_to_atom(ModQ),
    ClausesAST = fn_to_clauses(build_fn([build_clause(Args, Guards, Body)|ClausesQ])),
    {clauses, Mod, Fun, ClausesAST};
parse_quoted(_) ->
    xprof_core_lib:err("expression is not an xprof match-spec fun").

%% @doc Convert a quoted anonymous function to the Erlang AST representation
%% and return the list of clauses of the later
fn_to_clauses(QuotedFn) ->
    case quoted_to_ast(QuotedFn) of
        {ok, {'fun', _Loc, {clauses, ClausesAST}}} ->
            ClausesAST;
        {ok, _} ->
            xprof_core_lib:err("expression is not an xprof match-spec fun "
                               "(Erlang AST does not represent an anonymous function)");
        {error, Reason} ->
            xprof_core_lib:err("~ts", [Reason])
    end.

%% @doc Unhide some location info that is dropped by string_to_quoted
%% (column number is never returned)
pretty_err(Str) ->
    Tokens = tokenizer_err(Str, 1),
    _ = parser_err(Tokens).

tokenizer_err(Str, StartColumn) ->
    case tokenizer(Str, StartColumn) of
        {ok, Tokens} ->
            Tokens;
        {error, {"unexpected token: ", [$\", ":", $\"|_],
                 _Rest = "", [{identifier, Meta, Key}|SoFar]}} ->
            %% A kw_identifier is only complete if the colon is followed by a
            %% space.
            %% In this case the space is yet missing from the end.
            lists:reverse(SoFar, [{kw_identifier, Meta, Key}]);
        {error, {Error, TokenHint, Rest, _SoFar}} ->
            NextCol = length(Str) - length(Rest) + 1,
            xprof_core_lib:err(err_str(Error), [TokenHint, NextCol])
    end.

tokenizer(Str, StartColumn) ->
    unify_tokenizer_output(
      elixir_tokenizer:tokenize(Str, 1, StartColumn, [])).

unify_tokenizer_output({ok, Tokens}) ->
    {ok, Tokens};
unify_tokenizer_output({ok, _Line, _Column, Tokens}) ->
    %% FIXME old format returned before Elixir 1.6.0
    {ok, Tokens};
unify_tokenizer_output({error, {_Line, _Column, Error, TokenHint}, Rest, SoFar}) ->
    {error, {Error, TokenHint, Rest, SoFar}};
unify_tokenizer_output({error, {_Line, Error, TokenHint}, Rest, SoFar}) ->
    %% FIXME old error format without column before Elixir 1.7
    {error, {Error, TokenHint, Rest, SoFar}}.

%% @doc
parser_err(Tokens) ->
    case do_parse_tokens(Tokens) of
        {error, {Loc, Mod, Err}} ->
            xprof_core_lib:err(Loc, Mod, Err);
        {error, Reason} ->
            xprof_core_lib:err("~ts", [Reason]);
        {ok, AST} ->
            AST
    end.

do_parse_tokens(Tokens) ->
    put(elixir_parser_file, <<"nofile">>),
    put(elixir_formatter_metadata, false),
    %% added in Elixir 1.6.0
    %% Support `columns: true' in `Code.string_to_quoted'
    put(elixir_parser_columns, true),

    try elixir_parser:parse(Tokens) of
        {error, {_Loc, _Mod, _Err}} = Error ->
            Error;
        {ok, Quoted} ->
            quoted_to_ast(Quoted)
    catch
        %% I couldn't find a case where an error is thrown instead of returned
        %% but elixir:string_to_quoted does catch too
        {error, {_Loc, _Mod, _Err}} = Error ->
            Error
    after
        erase(elixir_parser_file),
        erase(elixir_formatter_metadata),
        erase(elixir_parser_columns)
    end.

err_str({ErrorPrefix, ErrorSuffix}) ->
    lists:flatten([ErrorPrefix, "~s", ErrorSuffix, " at column ~p"]);
err_str(Error) ->
    lists:flatten([Error, "~s at column ~p"]).

%% @doc Convert an Elixir quoted expression representing an Elixir module
%% identifier (an atom or a dot-delimited alias list) into an Erlang module name
%% atom
-spec mod_to_atom(ex_quoted()) -> module().
mod_to_atom(Quoted) when is_atom(Quoted) ->
    Quoted;
mod_to_atom({__aliasis, _, _} = Quoted) ->
    'Elixir.Macro':expand(Quoted, elixir:env_for_eval([])).

%% @doc Convert an Elixir quoted expression to an Erlang abstract syntax tree
-spec quoted_to_ast(ex_quoted()) -> {ok, erl_ast()} | {error, Reason :: binary()}.
quoted_to_ast(Quoted) ->
    %% pretend that the quoted expression is within a function,
    %% this way local function calls are allowed
    %% (also expressions which look like local function calls
    %%  like 'return_trace()' required for fun2ms)
    Env = maps:put(function, {ms, 0}, elixir:env_for_eval([])),
    try elixir:quoted_to_erl(Quoted, Env) of
        {Ast, _NewEnv, _Scope} -> {ok, Ast}
    catch error:Exception when is_map(Exception) ->
            case 'Elixir.Exception':'exception?'(Exception) of
                true ->
                    xprof_core_lib:fmt_err('Elixir.Exception':message(Exception));
                false ->
                    erlang:error(Exception)
                    %%xprof_core_lib:err("cannot convert quoted expression to Erlang AST")
            end
    end.

%% @doc Convert an Elixir-style camel-case alias to an Erlang-style snake-case
%% atom.
alias_to_cmd_atom(CmdAlias) when is_atom(CmdAlias) ->
    %% Macro.underscore can handle atoms also, but only if they start with
    %% 'Elixir.<alias>', so we have to convert to binary separately.
    CmdAliasBin = atom_to_binary(CmdAlias, unicode),
    _Cmd = binary_to_atom('Elixir.Macro':underscore(CmdAliasBin), unicode).

%% @doc Convert an Erlang-style snake-case atom to an Elixir-style camel-case
%% alias binary.
cmd_to_alias_bin(Cmd) ->
    CmdBin = atom_to_binary(Cmd, unicode),
    _CmdAliasBin = 'Elixir.Macro':camelize(CmdBin).

%%
%% Functions for autocomplete
%%

hidden_function(behaviour_info) -> true;
hidden_function(module_info) -> true;
hidden_function(Fun) ->
    case atom_to_list(Fun) of
        "__" ++ _ -> true;
        "MACRO-" ++ _ -> true;
        "-" ++ _ ->
            %% filter out private functions generated for fun objects
            %% and list comprehensions like '-filter_funs/2-fun-0-'
            true;
        _ -> false
    end.

fmt_mfa(Mod, Fun, Arity) ->
    'Elixir.Exception':format_mfa(Mod, Fun, Arity).

fmt_mod(Mod) ->
    'Elixir.Kernel':inspect(Mod).

fmt_mod_and_delim(Mod) ->
    fmt("~ts.", [fmt_mod(Mod)]).

%% `Inspect.Function.escape_name/1` was only introduced after Elixir 1.4.0
%% and was in turn replaced by `Code.Identifier.inspect_as_function/1`
%% in Elixir 1.6.0 (with the introduction of unquoted unicode function names,
%% and in OTP 20 unicode atoms).
%% The most compatible solution is to cut the interesting part
%% from the documented `Exception.format_mfa/3` (which had known bugs
%% in some Elixir versions, but that's life).
fmt_fun('') ->
    <<":\"\"">>;
fmt_fun(Fun) ->
    %%'Elixir.Inspect.Function':escape_name(Fun).
    FunArity = fmt_fun_and_arity(Fun, 0),
    FunSize = byte_size(FunArity) - 2,
    <<FunBin:FunSize/binary, "/0">> = FunArity,
    FunBin.

fmt_fun_and_arity(Fun, Arity) ->
    <<":\"\".", FunArity/binary>> = 'Elixir.Exception':format_mfa('', Fun, Arity),
    FunArity.

fmt_cmd(Cmd) ->
    cmd_to_alias_bin(Cmd).

fmt_param(Param) ->
    try 'Elixir.Code.Identifier':inspect_as_key(Param)
    catch error:undef ->
            %% FIXME inspect_as_key was introduced in Elixir 1.6
            fmt("~ts:", [atom_to_list(Param)])
    end.

fmt_param_and_delim(Param) ->
    %% add an extra space after
    fmt("~ts ", [fmt_param(Param)]).

fmt_exception(Class, Reason) ->
    %% Enforce empty stacktrace
    %% (Elixir is in some cases smart enough to figure out
    %%  current process's stacktrace)
    Stacktrace = [],
    'Elixir.Exception':format(Class, Reason, Stacktrace).

fmt_term(Term) ->
    'Elixir.Kernel':inspect(Term).

fmt(Fmt, Args) ->
    unicode:characters_to_binary(io_lib:format(Fmt, Args)).
