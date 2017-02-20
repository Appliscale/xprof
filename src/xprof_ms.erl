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
    case ms_transform:transform_from_shell(
           dbg, Clauses, _ImportList = []) of
        {error,[{_,[{Loc,Mod,Code}|_]}|_],_} ->
            err(Loc, Mod, Code);
        MS ->
            MS
    end.

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
