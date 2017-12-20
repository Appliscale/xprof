-module(xprof_core_cmd_funlatency).

-export([mandatory_params/0,
         param_from_ast/2,
         param_to_internal/2,

         get_cmd_id/1,

         %% tracer callbacks
         init/2,
         handle_event/3,
         take_snapshot/1
        ]).

mandatory_params() ->
    [mfa].

param_from_ast(mfa, MfaStr) when is_list(MfaStr) ->
    {ok, MfaStr};
param_from_ast(mfa, _WrongValue) ->
    {error, wrong_value};
param_from_ast(retmatch, RetMatchAst) ->
    case RetMatchAst of
        {'fun', _Loc, _Clauses} ->
            xprof_core_query:param_to_fun(RetMatchAst);
        Pattern ->
            Loc = element(2, Pattern),
            %% fun(Pattern) -> true;(_) -> false
            Fun = {'fun', Loc,
                   {clauses,
                    [{clause, Loc, [Pattern], [], [{atom, Loc, true}]},
                     {clause, Loc, [{var, Loc, '_'}], [], [{atom, Loc, false}]}
                    ]}},
            xprof_core_query:param_to_fun(Fun)
    end;
param_from_ast(_, _) ->
    {error, unknown_param}.

param_to_internal(mfa, Value) ->
    xprof_core_ms:fun2ms(Value);
param_to_internal(retmatch, Fun) ->
    case erlang:fun_info(Fun, arity) of
        1 -> {ok, Fun};
        2 -> {ok, Fun};
        _ -> {error, wrong_arity}
    end;
param_to_internal(_, _) ->
   {error, unknown_param}.

get_cmd_id(Params) ->
    MFASpec = proplists:get_value(mfa, Params),
    MFAId = xprof_core_lib:mfaspec2id(MFASpec),
    MFAId.

%% tracer

%% The largest duration value that can be stored in the HDR histogram in ms
-define(MAX_DURATION, 30*1000).

-record(state, {hdr_ref,
                max_duration,
                ignore_recursion}).

init(_Options, _MFASpec) ->
    MaxDuration = application:get_env(xprof_core, max_duration, ?MAX_DURATION) * 1000,
    IgnoreRecursion = application:get_env(xprof_core, ignore_recursion, true),
    {ok, HDR} = hdr_histogram:open(MaxDuration, 3),
    {ok, #state{hdr_ref = HDR,
                max_duration = MaxDuration,
                ignore_recursion = IgnoreRecursion}}.

handle_event({trace_ts, Pid, call, _MFA, Args, StartTime}, _, State) ->
    put_ts_args(Pid, StartTime, Args, State#state.ignore_recursion),
    ok;
handle_event({trace_ts, Pid, Tag, MFA, RetOrExc, EndTime},
             CaptureThreshold,
             State = #state{hdr_ref = Ref,
                            max_duration = MaxDuration})
  when Tag =:= return_from;
       Tag =:= exception_from ->

    case get_ts_args(Pid, State#state.ignore_recursion) of
        undefined ->
            ok;
        {StartTime, Args} ->
            CallTime = timer:now_diff(EndTime, StartTime),
            if CallTime > MaxDuration ->
                    lager:error("Call ~p took ~p ms that is larger than the maximum "
                                "that can be stored (~p ms)",
                                [MFA, CallTime/1000, MaxDuration div 1000]),
                    ok = hdr_histogram:record(Ref, MaxDuration);
               true ->
                    ok = hdr_histogram:record(Ref, CallTime)
            end,

            maybe_capture({Pid, CallTime, Args, {Tag, RetOrExc}},
                          CaptureThreshold, State)
    end.

take_snapshot(#state{hdr_ref = Ref}) ->
    Snapshot = get_current_hist_stats(Ref),
    hdr_histogram:reset(Ref),
    Snapshot.


%% helpers for tracer callbacks

put_ts_args(Pid, StartTime, Args, IgnoreRecursion) ->
    %% Count the depth of recursion in this process
    CD = case get({Pid, call_depth}) of
             undefined -> 1;
             CallDepth -> CallDepth + 1
         end,
    put({Pid, call_depth}, CD),
    case CD =:= 1 orelse not IgnoreRecursion of
        true ->
            put({Pid, CD, ts_args}, {StartTime, Args});
        false ->
            ok
    end.

%% @doc If IgnoreRecursion is true only return start time and args
%% of the outermost call
get_ts_args(Pid, IgnoreRecursion) ->
    case get({Pid, call_depth}) of
        undefined ->
            %% we missed the call of this function
            undefined;
        1 ->
            erase({Pid, call_depth}),
            erase({Pid, 1, ts_args});
        CD when CD > 1 ->
            put({Pid, call_depth}, CD - 1),
            case IgnoreRecursion of
                false ->
                    erase({Pid, CD, ts_args});
                true ->
                    undefined
            end
    end.

maybe_capture(_, _Threshold = undefined, _State) ->
    ok;
maybe_capture({_Pid, CallTime, Args, _Res} = Item, Threshold, _State) ->
    case Threshold of
        _ when CallTime > Threshold * 1000 andalso
               Args =/= arity ->
            {capture, Item};
        _ ->
            ok
    end.

get_current_hist_stats(HistRef) ->
    [{min,      hdr_histogram:min(HistRef)},
     {mean,     hdr_histogram:mean(HistRef)},
     %%{median,   hdr_histogram:median(HistRef)},
     {max,      hdr_histogram:max(HistRef)},
     %%{stddev,   hdr_histogram:stddev(HistRef)},
     %%{p25,      hdr_histogram:percentile(HistRef,25.0)},
     {p50,      hdr_histogram:percentile(HistRef,50.0)},
     {p75,      hdr_histogram:percentile(HistRef,75.0)},
     {p90,      hdr_histogram:percentile(HistRef,90.0)},
     {p99,      hdr_histogram:percentile(HistRef,99.0)},
     %%{p9999999, hdr_histogram:percentile(HistRef,99.9999)},
     %%{memsize,  hdr_histogram:get_memory_size(HistRef)},
     {count,    hdr_histogram:get_total_count(HistRef)}].
