-module(xprof_ms).

-export([fun2ms/1,
         err/1, err/2, err/3
        ]).

-spec fun2ms(string()) -> {mfa, module(), atom(), integer()}
                        | {ms, module(), atom(), tuple()}
                        | {error, string()}.
fun2ms(Str) ->
    ModeCb = xprof_lib:get_mode_cb(),
    try
        case ModeCb:parse_query(Str) of
            {mfa, M, F, '*'} ->
                {ms, M, F, fix_ms([{'_', [], []}])};
            {mfa, _M, _F, _Arity} = MFA ->
                MFA;
            {clauses, M, F, Clauses} ->
                MS = ms(Clauses),
                {ms, M, F, fix_ms(MS)}
        end
    catch throw:Error ->
            Error
    end.

ms(Clauses) ->
    IsEmptyArgs = case Clauses of
                      [{clause, _, [], _, _}|_] -> true;
                      _ -> false
                  end,
    ERR_HEAD = 3,
    case ms_transform:transform_from_shell(
           dbg, wrap_args(Clauses), _ImportList = []) of
        {error,[{_, [{_, ms_transform, ERR_HEAD}|_]}|_], _} when IsEmptyArgs ->
            %% A bug in ms_trasform that was only fixed in OTP 19.2 prevents
            %% empty list as head in "dbg:fun2ms(fun([]) -> ..."
            %% (see https://github.com/erlang/otp/commit/8db6c68b)
            workaround_empty_args_ms(ms(workaround_empty_args_cl(Clauses)));
        {error,[{_,[{Loc,Mod,Code}|_]}|_],_} ->
            err(Loc, Mod, Code);
        MS ->
            MS
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

%% @doc Ensure that the match-spec does not create traces that have different
%% format than what xprof_trace_handler anticipates (ie. {message, _} directives
%% might have to be modified)

%% - The special case {message, false} is allowed (disables sending of trace
%% messages ('call' and 'return_to') for this function call, just like if the
%% match specification had not matched).

%% - The special case {message, true} must be avoided (sets the default
%% behavior, ie. trace message is sent with no extra information). These calls
%% are replaced with our default message ({message, arity} or {message, '$_'})

%% - Other values for messages are allowed but later overriden by placing
%% {message, arity} at the end of the match-spec body in case argument capturing
%% is off

%% - For the general case when the match-spec body does not contain any message
%% directive a default message ({message, arity} or {message, '$_'}) is inserted
%% as the first action of the body as well as enabling return_trace

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
      [{return_trace},{message, DefaultMsg}|traverse_ms_c(Body, Capture)]}
     || {Head, Condition, Body} <- MS].

%% @doc traverse a match-spec clause
traverse_ms_c([{message, true}|T], false) ->
    [{message, arity}|traverse_ms_c(T, false)];
traverse_ms_c([{message, true}|T], true) ->
    [{message, '$_'}|traverse_ms_c(T, true)];
traverse_ms_c([{message, Other}|T], false) when Other =/= false ->
    [{message, arity}|traverse_ms_c(T, false)];
traverse_ms_c([H|T], C) ->
    [traverse_ms_c(H, C)|traverse_ms_c(T, C)];
traverse_ms_c(Tuple, C) when is_tuple(Tuple) ->
    list_to_tuple(traverse_ms_c(tuple_to_list(Tuple), C));
traverse_ms_c([], _) ->
    [];
traverse_ms_c(Other, _) ->
    Other.


err(Fmt) ->
    throw({error, fmt(Fmt, [])}).

err(Fmt, Args) ->
    throw({error, fmt(Fmt, Args)}).

err({1, StartCol, _EndCol}, Mod, Err) ->
    err({1, StartCol}, Mod, Err);

err({1, Col}, Mod, Err) ->
    throw({error, fmt("~s at column ~p", [Mod:format_error(Err), Col])});

err(1, Mod, Err) ->
    throw({error, fmt(Mod:format_error(Err), [])}).

fmt(Fmt, Args) ->
    lists:flatten(io_lib:format(Fmt, Args)).
