%%% @doc Supervisor
-module(xprof_tracer_handler_sup).

-behaviour(supervisor).

%% API
-export([start_link/0]).

%% Supervisor callbacks
-export([init/1]).

-define(SERVER, ?MODULE).

%%% API functions
start_link() ->
        supervisor:start_link({local, ?SERVER}, ?MODULE, []).

%%% Supervisor callbacks
init([]) ->
    RestartStrategy = simple_one_for_one,
    MaxRestarts = 0,
    MaxSecondsBetweenRestarts = 1,
    
    SupFlags = {RestartStrategy, MaxRestarts, MaxSecondsBetweenRestarts},
    
    Child = {xprof_tracer_handler,
	     {xprof_tracer_handler, start_link, []},
	     permanent,
	     5000,
	     worker,
	     [xprof_tracer_handler]},
    
    {ok, {SupFlags, [Child]}}.
