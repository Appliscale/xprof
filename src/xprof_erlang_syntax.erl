%%%
%%% @doc Module to parse and format expressions in Erlang syntax
%%%
-module(xprof_erlang_syntax).

-behaviour(xprof_language).

-export([parse_query/1,
         normalise_query/1,
         hidden_function/1,
         fmt_mfa/3,
         fmt_mod_and_delim/1,
         fmt_mod/1,
         fmt_fun_and_arity/2,
         fmt_fun/1,
         fmt_term/1]).

%% @doc Parse a query string that represents either a module-function-arity
%% or an xprof-flavoured match-spec fun in Erlang syntax.
%% In the later case the last element of the tuple is the abstract syntax tree
%% of the clauses of the anonimous function.
parse_query(Str) ->
    case tokens(Str) of
        {mfa, _M, _F, _Arity} = MFA ->
            MFA;
        {clauses, M, F, Tokens} ->
            Clauses = parse(Tokens),
            {clauses, M, F, Clauses}
    end.

tokens(Str) ->
    case erl_scan:string(Str, {1,1}) of
        {error, {_Loc, Mod, Err}, Loc} ->
            xprof_ms:err(Loc, Mod, Err);
        {ok, [{atom, _, M}, {':', _},
              {atom, _, F}, {'/', _},
              {integer, _, A}], _EndLoc} ->
            {mfa, M, F, A};
        {ok, [{atom, _, M}, {':', _},
              {atom, _, F}|Tokens], _EndLoc} when Tokens =/= [] ->
            {clauses, M, F, [{'fun', 0}|ensure_end(ensure_body(Tokens))]};
        {ok, Tokens, _EndLoc} ->
            xprof_ms:err("expression is not an xprof match-spec fun ~w", [Tokens])
    end.

%% @doc Ensure the fun has at least a trivial function body "-> true".
%% Omitting body is only allowed if there is only a single clause.
ensure_body(Tokens) ->
    case lists:keymember('->', 1, Tokens) of
        true ->
            Tokens;
        false ->
            Loc = get_loc(lists:last(Tokens)),
            Tokens ++ [{'->', Loc}, {atom, Loc, true}]
    end.

get_loc({_, Loc}) -> Loc;
get_loc({_, Loc, _}) -> Loc.

%% @doc Ensure the fun is properly closed with "end."
ensure_end(Tokens) ->
    case lists:reverse(Tokens) of
        [{dot, _}, {'end', _}| _] -> Tokens;
        [{dot, Loc}|T] -> lists:reverse(T, [{'end', Loc}, {dot, Loc}]);
        [Last|_] = R ->
            Loc = element(2, Last),
            lists:reverse(R, [{'end', Loc}, {dot, Loc}])
    end.

parse(Tokens) ->
    case erl_parse:parse_exprs(Tokens) of
        {error, {Loc, Mod, Err}} ->
            xprof_ms:err(Loc, Mod, Err);
        {ok, [{'fun', _Loc, {clauses, Clauses}}]} ->
            Clauses;
        {ok, _} ->
            xprof_ms:err("expression is not an xprof match-spec fun")
    end.

%%
%% Functions for autocomplete
%%

normalise_query(Query) ->
    Query.

hidden_function(module_info) -> true;
hidden_function(Fun) ->
    case atom_to_list(Fun) of
        "-" ++ _ ->
            %% filter out local functions generated for fun objects
            %% and list comprehensions like '-filter_funs/2-fun-0-'
            true;
        _ -> false
    end.

fmt_mfa(Mod, Fun, Arity) ->
    fmt("~w:~w/~b", [Mod, Fun, Arity]).

fmt_mod(Mod) ->
    fmt("~w", [Mod]).

fmt_mod_and_delim(Mod) ->
    fmt("~w:", [Mod]).

fmt_fun(Fun) ->
    fmt("~w", [Fun]).

fmt_fun_and_arity(Fun, Arity) ->
    fmt("~w/~b", [Fun, Arity]).

fmt_term(Term) ->
    fmt("~p", [Term]).

fmt(Fmt, Args) ->
    list_to_binary(io_lib:format(Fmt, Args)).
