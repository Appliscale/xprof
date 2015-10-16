%% -*- erlang-indent-level: 4;indent-tabs-mode: nil -*-
%% ex: ts=4 sw=4 et

-module(xprof_tracer).

-behaviour(gen_server).

-export([start_link/0,
         trace/1, stop_trace/0,
         monitor/1, demonitor/1,
         data/2]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-record(state, {trace_spec,     %% trace specification
                paused=false,   %% tracing paused by user?
                overflow=false  %% tracing is paused because of overflow?
               }).

%% @doc Starts xprof tracer process.
-spec start_link() -> {ok, pid()}.
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

%% @doc Starts monitoring specified function calls.
-spec monitor(mfa()) -> ok.
monitor({Mod, Fun, Arity} = MFA) ->
    lager:info("Starting monitoring ~w:~w/~b",[Mod,Fun,Arity]),
    gen_server:call(?MODULE, {monitor, MFA}).

%% @doc Stops monitoring specified function calls.
-spec demonitor(mfa()) -> ok.
demonitor({Mod, Fun, Arity} = MFA) ->
    lager:info("Stopping monitoring ~w:~w/~b",[Mod,Fun,Arity]),
    gen_server:call(?MODULE, {demonitor, MFA}).

%% @doc Returns metrics gathered for particular function.
-spec data(mfa(), non_neg_integer()) -> list(proplists:proplist()) |
                                        {error, not_found}.
data(MFA, TS) ->
    xprof_tracer_handler:data(MFA, TS).

%% @doc Turns on or resumes tracing for a process specified by pid, all
%% processes or processes that are spawned by specified spawner pid.
-spec trace(pid() | resume | all | {spawner, pid()}) -> ok.
trace(PidOrSpec) ->
    lager:info("Tracing ~p", [PidOrSpec]),
    gen_server:call(?MODULE, {trace, PidOrSpec}).

%% @doc Stops tracing without clearing all monitors. Tracing can be resumed by
%% calling trace(resume) function.
stop_trace() ->
    lager:info("Sttoping tracing"),
    gen_server:call(?MODULE, stop_trace).

%% gen_server callbacks

init([]) ->
    init_tracer(),
    {ok, #state{}}.

handle_call({trace, PidSpec}, _From, State) ->
    NewState = setup_trace(PidSpec, State),
    {reply, ok, NewState};
handle_call({monitor, MFA}, _From, State) ->
    case get({handler, MFA}) of
        Pid when is_pid(Pid) ->
            {reply, {error, already_traced}, State};
        undefined ->
            {ok, Pid} = supervisor:start_child(xprof_tracer_handler_sup, [MFA]),
            put({handler, MFA}, Pid),
            MatchSpec = [{'_', [], [{return_trace}]}],
            erlang:trace_pattern(MFA, MatchSpec, [local]),
            {reply, ok, State}
    end;
handle_call({demonitor, MFA}, _From, State) ->
    erlang:trace_pattern(MFA, false, [local]),
    Pid = erase({handler, MFA}),
    supervisor:terminate_child(xprof_tracer_handler_sup, Pid),
    {reply, ok, State};
handle_call(_Request, _From, State) ->
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(Msg = {trace_ts, _TracedPid, call, {M,F,Args}, _StartTime}, State) ->
    NewState = check_for_overflow(State),
    MFA = {M,F,length(Args)},
    case get({handler, MFA}) of
        undefined ->
            ok;
        Pid ->
            erlang:send(Pid, Msg)
    end,
    {noreply, NewState};
handle_info(Msg = {trace_ts, _TracedPid, return_from, MFA , _Res, _StartTime},
            State) ->
    NewState = check_for_overflow(State),
    case get({handler, MFA}) of
        undefined ->
            {noreply, NewState};
        Pid ->
            erlang:send(Pid, Msg),
            {noreply, NewState}
    end;
handle_info({trace_ts, _Spawner, spawn, NewProc, _MFArgs,_TimeStamp},
            State = #state{trace_spec=TraceSpec}) ->
    NewState = check_for_overflow(State),

    %% trace spec could have been changed while there were late messages
    %% in the queue
    Sampl = case TraceSpec of
                {spawner, _Pid, X} -> X;
                _ -> 0.0
            end,

    case random:uniform() < Sampl of
        true ->
            catch erlang:trace(NewProc, true, [call, procs, timestamp]);
        false ->
            ok
    end,
    {noreply, NewState};
handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% Internal functions

init_tracer() ->
    erlang:trace_pattern({'_','_','_'}, false, [local]),
    erlang:trace(all, true, [call, timestamp]).

check_for_overflow(State = #state{paused=false, overflow=true,
                                  trace_spec=TraceSpec}) ->
    {_, QLen} = erlang:process_info(self(), message_queue_len),
    case QLen =< 100 of
        true ->
            set_trace_opts(true, TraceSpec),
            State#state{overflow=false};
        false ->
            State
    end;
check_for_overflow(State = #state{paused=false, overflow=false,
                                  trace_spec=TraceSpec}) ->
    {_, QLen} = erlang:process_info(self(), message_queue_len),
    case QLen >= 1000 of
        true ->
            set_trace_opts(false, TraceSpec),
            State#state{overflow=true};
        false ->
            State
    end.

setup_trace(pause, State) ->
    set_trace_opts(false, State#state.trace_spec),
    State#state{paused = true};
setup_trace(resume, State = #state{trace_spec=Spec}) ->
    setup_trace(Spec, State#state{trace_spec=undefined});
setup_trace(Spec, State = #state{trace_spec=undefined}) ->
    set_trace_opts(true, Spec),
    State#state{trace_spec=Spec, paused=false};
setup_trace(Spec, State) ->
    catch set_trace_opts(false, State#state.trace_spec),
    setup_trace(Spec, State#state{trace_spec=undefined}).

set_trace_opts(How, {spawner, SpwPid, _Sampl}) ->
    erlang:trace(SpwPid, How, [procs, timestamp]);
set_trace_opts(How, all) ->
    erlang:trace(all, How, [call, timestamp]);
set_trace_opts(How, Pid) when is_pid(Pid) ->
    erlang:trace(Pid, How, [call, timestamp]);
set_trace_opts(_How, undefined) ->
    true.
