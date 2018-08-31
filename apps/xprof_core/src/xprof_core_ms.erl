-module(xprof_core_ms).

-export([fun2ms/1,
         default_ms/0,
         format_error/1,
         err/1, err/2, err/3
        ]).

-spec fun2ms(string()) -> {ok, xprof_core:mfa_spec()}
                        | {error, string()}.
fun2ms(Str) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    try
        case ModeCb:parse_query(Str) of
            {mfa, MFA} ->
                {ok, {MFA, default_ms()}};
            {clauses, M, F, Clauses} ->
                Arity = get_arity(Clauses),
                RecDefs = xprof_core_records:get_record_defs(),
                MS = ms(Clauses, RecDefs),
                {ok, {{M, F, Arity}, fix_ms(MS)}}
        end
    catch throw:Error ->
            Error
    end.

default_ms() ->
    fix_ms([{'_', [], []}]).

%% @doc Convert the fun to a match spec
%% In order to also support records the parse_transform callback is used
%% which collects record definitions from the input forms
%% (the transform_from_shell api does not support recods as the shell
%%  already expanded records before it passes the fun clauses as input)
ms(Clauses, RecDefs) ->
    IsEmptyArgs = (get_arity(Clauses) =:= 0),
    ERR_DBG_HEAD = 3,
    ERR_HEADMATCH = 4,
    case ms_transform(Clauses, RecDefs) of
        {error,[{_, [{_, ms_transform, ERR_DBG_HEAD}|_]}|_], _} when IsEmptyArgs ->
            %% A bug in ms_trasform that was only fixed in OTP 19.2 prevents
            %% empty list as head in "dbg:fun2ms(fun([]) -> ..."
            %% (see https://github.com/erlang/otp/commit/8db6c68b)
            workaround_empty_args_ms(
              ms(workaround_empty_args_cl(Clauses), RecDefs));
        {error,[{_, [{Loc ,ms_transform, ERR_HEADMATCH}]}], _} ->
            err(Loc, ?MODULE, ms_transform_headmatch);
        {error,[{_,[{Loc,Mod,Code}|_]}|_],_} ->
            err(Loc, Mod, Code);
        MS ->
            MS
    end.

get_arity([{clause, _, Args, _, _}|_]) ->
    length(Args).

%% The type-spec of ms_transform:parse_transform is incomplete so if it is
%% called directly, dialyzer complains that patterns `{error, _, _}' can never
%% match.
%% Use the slimmest form of the compiler instead.
-spec ms_transform(Clauses, [tuple()]) -> xprof_core:ms() | Error when
      Clauses :: [erl_parse:abstract_clause()],
      Error :: {error, ErrInfo :: [tuple()], WarnInfo :: []}.
ms_transform(Clauses, RecDefs) ->
    Result = compile:forms(
               wrap_forms(wrap_args(Clauses), RecDefs),
               [{parse_transform, ms_transform},
                export_all, binary, 'P', return_errors]),
    case Result of
        {ok, [], Forms} ->
            unwrap_forms(Forms);
        Error ->
            Error
    end.

wrap_args(Clauses) ->
    [{clause, Loc, [build_list(Args)], Guards, Body}
      ||{clause, Loc, Args, Guards, Body} <- Clauses].

build_list([]) ->
    {nil, 0};
build_list([Arg|Args]) ->
    Loc = element(2, Arg),
    {cons, Loc, Arg, build_list(Args)}.

workaround_empty_args_cl(Clauses) ->
    [{clause, Loc, [{var, 0, '_'}], Guards, Body}
      ||{clause, Loc, [], Guards, Body} <- Clauses].

workaround_empty_args_ms(Ms) ->
    [{[], G, B} || {['_'], G, B} <- Ms].

%% @doc The match spec fun clauses are wrapped into a form list
%% which contains the record definitions from module M
%% followed by the below function definition
%% `f() -> dbg:fun2ms(fun <Clauses>).'
%% The body of the function (ie the call dbg:fun2ms) is converted
%% to a match spec by the parse transform.
wrap_forms(Clauses, RecDefs) ->
    [{attribute,{1,1},module,m}]
        ++
    RecDefs
        ++
    [{function,{1,1},f,0,
      [{clause,{1,1},[],[],
        [{call,{1,1},
          {remote,{1,1},{atom,{1,1},dbg},{atom,{1,1},fun2ms}},
          [{'fun',{1,1},{clauses, Clauses}}]
         }]
       }]
     }].

unwrap_forms(Forms) ->
    {function, _, f, 0, [{clause, _, [], [], [MsAst]}]} = lists:last(Forms),
    erl_syntax:concrete(MsAst).

%% @doc Ensure that the match-spec does not create traces that have different
%% format than what xprof_core_trace_handler anticipates (ie. {message, _}
%% directives might have to be modified)

%% - The special case {message, false} is allowed (disables sending of trace
%% messages ('call' and 'return_to') for this function call, just like if the
%% match specification had not matched).

%% - The special case {message, true} must be avoided (sets the default
%% behavior, ie. trace message is sent with no extra information). These calls
%% are replaced with our default message ({message, arity} or {message, '$_'})

%% - Other values for messages are allowed but replaced by {message, arity} in
%% case argument capturing is off

%% - For the general case when the match-spec body does not contain any message
%% directive a default message ({message, arity} or {message, '$_'}) is inserted
%% as the first action of the body as well as enabling exception_trace

fix_ms(MS) ->
    {traverse_ms(MS, _CaptureOff = false),
     traverse_ms(MS, _CaptureOn = true)}.

traverse_ms(MS, Capture) ->
    DefaultMsg =
        case Capture of
            false -> arity;
            true -> '$_'
        end,
    [{Head, Condition,
      [{exception_trace},{message, DefaultMsg}|traverse_ms_c(Body, Capture)]}
     || {Head, Condition, Body} <- MS].

%% @doc traverse a match-spec clause
traverse_ms_c([{message, true}|T], false) ->
    [{message, arity}|traverse_ms_c(T, false)];
traverse_ms_c([{message, true}|T], true) ->
    [{message, '$_'}|traverse_ms_c(T, true)];
traverse_ms_c([{message, Other}|T], false) when Other =/= false ->
    %% In case `Other' evaluates to `false', return `false' (disable sending a
    %% trace message). Otherwise return `arity'.
    %% message( (Other =/= false ) andalso 'arity' )
    [{message, {'andalso', {'=/=', Other, false}, arity}}|traverse_ms_c(T, false)];
traverse_ms_c([H|T], C) ->
    [traverse_ms_c(H, C)|traverse_ms_c(T, C)];
traverse_ms_c(Tuple, C) when is_tuple(Tuple) ->
    list_to_tuple(traverse_ms_c(tuple_to_list(Tuple), C));
traverse_ms_c([], _) ->
    [];
traverse_ms_c(Other, _) ->
    Other.

format_error(ms_transform_headmatch) ->
    %% In a regular match-spec-fun it is only possible to match the list of args
    %% ie. the top level.  However in the xprof flavor the args are not wrapped
    %% in a list so even that isn't possible. So let's rewrite the error message
    %% a little from "in fun head, only matching (=) on toplevel can be
    %% translated into match_spec"
    %% (example "fun(T = {tag, _})")
    "matching (=) in fun head cannot be translated into a match-spec".

-spec err(string()) -> no_return().
err(Fmt) ->
    throw({error, fmt(Fmt, [])}).

-spec err(string(), list()) -> no_return().
err(Fmt, Args) ->
    throw({error, fmt(Fmt, Args)}).

-spec err(tuple() | integer(), module(), term()) -> no_return().
err({1, StartCol, _EndCol}, Mod, Err) ->
    err({1, StartCol}, Mod, Err);

err({1, Col}, Mod, Err) ->
    throw({error, fmt("~s at column ~p", [Mod:format_error(Err), Col])});

err(1, Mod, Err) ->
    throw({error, fmt(Mod:format_error(Err), [])}).

fmt(Fmt, Args) ->
    lists:flatten(io_lib:format(Fmt, Args)).
