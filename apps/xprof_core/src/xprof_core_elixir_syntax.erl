%%%
%%% @doc Module to parse and format expressions in Elixir syntax
%%%
-module(xprof_core_elixir_syntax).

-behaviour(xprof_core_language).

-export([parse_query/1,
         parse_incomplete_query/1,
         parse_match_spec/1,
         hidden_function/1,
         fmt_mfa/3,
         fmt_mod_and_delim/1,
         fmt_mod/1,
         fmt_fun_and_arity/2,
         fmt_fun/1,
         fmt_exception/2,
         fmt_term/1]).

%% from elixir.hrl
-define(is_upcase(S), (S >= $A andalso S =< $Z)).

%% Elixir quoted expressions
-type ex_quoted() :: tuple().
%% Erlang abstract syntax tree
-type erl_ast() :: tuple().

%% @doc Parse a query string that represents either an xprof-flavoured
%% match-spec fun or an extended xprof query in Elixir syntax.
parse_query("%" ++ _ = _Query) ->
    {error, not_implemented};
parse_query(Query) ->
    {ok, funlatency, [{mfa, Query}]}.

-spec parse_incomplete_query(string()) ->
    {ok, Cmd, Params}
  | {incomplete_cmd, CmdPrefix}
  | {incomplete_key, KeyPrefix, Cmd, ParamsSoFar}
  | {incomplete_value, Key, ValuePrefix, Cmd, ParamsSoFar}
  when
      Cmd :: xprof_core:cmd(),
      CmdPrefix :: atom(), %% binary()/string() ???
      Params :: xprof_core:params(),
      ParamsSoFar :: xprof_core:params(),
      Key :: atom(),
      KeyPrefix :: atom(), %% binary()/string() ???
      ValuePrefix :: string(). %% binary() ???
%% throw:{error, Reason :: term()}
parse_incomplete_query(_Query) ->
    %%{ok, Tokens, Rest} = tokens_query(Query, incomplete),
    %%case parse_query_tokens(Tokens, cmd, undefined, []) of
    %%    _ ->
    %%        []
    %%end.
    [].

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
    try quoted_to_ast(QuotedFn) of
        {'fun', _Loc, {clauses, ClausesAST}} ->
            ClausesAST;
        _ ->
            xprof_core_lib:err("expression is not an xprof match-spec fun "
                         "(Erlang AST does not represent an anonymous function)")
    catch C:Exception ->
            case 'Elixir.Exception':'exception?'(Exception) of
                true ->
                    xprof_core_lib:err('Elixir.Exception':message(Exception));
                false ->
                    erlang:C(Exception)
                    %%xprof_core_lib:err("cannot convert quoted expression to Erlang AST")
            end
    end.

%% @doc Unhide some location info that is dropped by string_to_quoted
%% (column number is never returned)
pretty_err(Str) ->
    Tokens = tokenizer_err(Str),
    _ = parser_err(Tokens).

tokenizer_err(Str) ->
    case elixir_tokenizer:tokenize(Str, 1, []) of
        {ok, Tokens} ->
            Tokens;
        {ok, _Line, _Column, Tokens} ->
            %% old format returned before Elixir 1.6.0
            Tokens;
        {error, {_Line, Error, Token}, Rest, _SoFar} ->
            NextCol = length(Str) - length(Rest) + 1,
            xprof_core_lib:err(err_str(Error), [Token, NextCol])
    end.

%% @doc 
parser_err(Tokens) ->
    put(elixir_parser_file, <<"nofile">>),
    put(elixir_formatter_metadata, false),

    try elixir_parser:parse(Tokens) of
        {error, {Loc, Mod, Err}} ->
            xprof_core_lib:err(Loc, Mod, Err);
        {ok, Quoted} ->
            quoted_to_ast(Quoted)
    catch
        %% I couldn't find a case where an error is thrown instead of returned
        %% but elixir:string_to_quoted does catch too
        {error, {Loc, Mod, Err}} ->
            xprof_core_lib:err(Loc, Mod, Err)
    after
        erase(elixir_parser_file),
        erase(elixir_formatter_metadata)
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
-spec quoted_to_ast(ex_quoted()) -> erl_ast().
quoted_to_ast(Quoted) ->
    %% pretend that the quoted expression is within a function,
    %% this way local function calls are allowed
    %% (also expressions which look like local function calls
    %%  like 'return_trace()' required for fun2ms)
    Env = maps:put(function, {ms, 0}, elixir:env_for_eval([])),
    {Ast, _NewEnv, _Scope} = elixir:quoted_to_erl(Quoted, Env),
    Ast.

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
