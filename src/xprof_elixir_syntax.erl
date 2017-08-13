%%%
%%% @doc Module to parse and format expressions in Elixir syntax
%%%
-module(xprof_elixir_syntax).

-behaviour(xprof_language).

-export([parse_query/1,
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

%% @doc Parse a query string that represents either a module-funtion-arity
%% or an xprof-flavoured match-spec fun in Elixir syntax.
%% In the later case the last element of the tuple is the abstract syntax tree
%% of the clauses of the anonimous function.
parse_query(Str) ->
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
    xprof_ms:err("expression is not an xprof match-spec fun").

%% @doc Convert a quoted anonymous function to the Erlang AST representation
%% and return the list of clauses of the later
fn_to_clauses(QuotedFn) ->
    try quoted_to_ast(QuotedFn) of
        {'fun', _Loc, {clauses, ClausesAST}} ->
            ClausesAST;
        _ ->
            xprof_ms:err("expression is not an xprof match-spec fun "
                         "(Erlang AST does not represent an anonymous function)")
    catch C:Exception ->
            case 'Elixir.Exception':'exception?'(Exception) of
                true ->
                    xprof_ms:err('Elixir.Exception':message(Exception));
                false ->
                    erlang:raise(C, Exception, erlang:get_stacktrace())
                    %%xprof_ms:err("cannot convert quoted expression to Erlang AST")
            end
    end.

%% @doc Unhide some location info that is dropped by string_to_quoted
%% (column number is never returned)
pretty_err(Str) ->
    Tokens = tokenizer_err(Str),
    _ = parser_err(Tokens).

tokenizer_err(Str) ->
    case elixir_tokenizer:tokenize(Str, 1, []) of
        {ok, _, _, Tokens} ->
            Tokens;
        {error, {_Line, Error, Token}, _Rest, SoFar} ->
            xprof_ms:err(err_str(Error), [Token, get_next_col(SoFar)])
    end.

%% @doc 
parser_err(Tokens) ->
    put(elixir_parser_file, <<"nofile">>),
    try elixir_parser:parse(Tokens) of
        {error, {Loc, Mod, Err}} ->
            xprof_ms:err(Loc, Mod, Err);
        {ok, Quoted} ->
            quoted_to_ast(Quoted)
    catch
        %% I couldn't find a case where an error is thrown instead of returned
        %% but elixir:string_to_string does catch too
        {error, {Loc, Mod, Err}} ->
            xprof_ms:err(Loc, Mod, Err)
    after
        erase(elixir_parser_file)
    end.

err_str({ErrorPrefix, ErrorSuffix}) ->
    lists:flatten([ErrorPrefix, "~s", ErrorSuffix, " at column ~p"]);
err_str(Error) ->
    lists:flatten([Error, "~s at column ~p"]).

get_next_col([]) ->
    1;
get_next_col([{_, {_Line, _StartCol, EndCol}}|_]) ->
    EndCol + 1;
get_next_col([{_, {_Line, _StartCol, EndCol}, _}|_]) ->
    EndCol + 1.

%% @doc Convert an Elixir quoted expression representing an Elixir module
%% identifier (an atom or a dot-delimited alias list) into an Erlang module name
%% atom
-spec mod_to_atom(ex_quoted()) -> module().
mod_to_atom(Quoted) when is_atom(Quoted) ->
    Quoted;
mod_to_atom({__aliasis, _, _} = Quoted) ->
    'Elixir.Macro':expand(Quoted, elixir:env_for_eval([])).

%%%% @doc Convert an Elixir quoted expression to an Erlang abstract syntax tree
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

%% escape_name was only introduced after Elixir 1.4.0
fmt_fun('') ->
    <<":\"\"">>;
fmt_fun(Fun) ->
    %%'Elixir.Inspect.Function':escape_name(Fun).
    FunStr = atom_to_list(Fun),
    case callable_atom(FunStr) of
        true ->
            list_to_binary(FunStr);
        false ->
            fmt("\"~ts\"", [FunStr])
    end.

fmt_fun_and_arity(Fun, Arity) ->
    fmt("~ts/~b", [fmt_fun(Fun), Arity]).

fmt_exception(Class, Reason) ->
    %% Enforce empty stacktrace
    %% (Elixir is in some cases smart enough to figure out
    %%  current process's stacktrace)
    Stacktrace = [],
    'Elixir.Exception':format(Class, Reason, Stacktrace).

fmt_term(Term) ->
    'Elixir.Kernel':inspect(Term).

fmt(Fmt, Args) ->
    list_to_binary(io_lib:format(Fmt, Args)).

callable_atom([C|T]) when
      (C >= $a andalso C =< $z) orelse
      C =:= $_ ->
    callable_atom_rest(T);
callable_atom(_) ->
    false.

callable_atom_rest([]) -> true;
callable_atom_rest("?") -> true;
callable_atom_rest("!") -> true;
callable_atom_rest([C|T]) when
      (C >= $a andalso C =< $z) orelse
      (C >= $A andalso C =< $Z) orelse
      (C >= $0 andalso C=< $9) orelse
      C =:= $_ orelse C =:= $@ ->
    callable_atom_rest(T);
callable_atom_rest(_) ->
    false.
