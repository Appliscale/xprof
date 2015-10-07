%% -*- erlang-indent-level: 4;indent-tabs-mode: nil -*-
%% ex: ts=4 sw=4 et

-module(xprof_tracer).

-behaviour(gen_server).

-export([start_link/0, monitor/1, demonitor/1, data/2]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-record(state, {}).

-spec start_link() -> {ok, pid()}.
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

-spec monitor(mfa()) -> ok.
monitor({Mod, Fun, Arity} = MFA) ->
    lager:info("Starting monitoring ~w:~w/~b",[Mod,Fun,Arity]),
    gen_server:call(?MODULE, {monitor, MFA}).

-spec demonitor(mfa()) -> ok.
demonitor({Mod, Fun, Arity} = MFA) ->
    lager:info("Stopping monitoring ~w:~w/~b",[Mod,Fun,Arity]),
    gen_server:call(?MODULE, {demonitor, MFA}).

-spec data(mfa(), non_neg_integer()) ->
                  proplists:proplist() | {error, not_found}.
data(MFA, TS) ->
    xprof_tracer_handler:data(MFA, TS).

%% gen_server callbacks

init([]) ->
    init_tracer(),
    {ok, #state{}}.

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
    MFA = {M,F,length(Args)},
    case get({handler, MFA}) of
        undefined ->
            ok;
        Pid ->
            erlang:send(Pid, Msg)
    end,
    {noreply, State};
handle_info(Msg = {trace_ts, _TracedPid, return_from, MFA ,_Res, _StartTime}, State) ->
    case get({handler, MFA}) of
        undefined ->
            {noreply, State};
        Pid ->
            erlang:send(Pid, Msg),          
            {noreply, State}
    end;
handle_info(Info, State) ->
    lager:warn("Unexpected msg received: ~p", [Info]),
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% Internal functions

init_tracer() ->
    erlang:trace_pattern({'_','_','_'}, false, [local]),
    erlang:trace(all, true, [timestamp, call]).
