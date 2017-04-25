%% @doc xprof top level supervisor.
-module(xprof_sup).

-behaviour(supervisor).

%% API
-export([start_link/0]).

%% Supervisor callbacks
-export([init/1]).

-define(SERVER, ?MODULE).

%% API functions

start_link() ->
    supervisor:start_link({local, ?SERVER}, ?MODULE, []).

%% Supervisor callbacks

init([]) ->
    TraceHandlerSup =
        {xprof_tracer_handler_sup,
            {xprof_tracer_handler_sup, start_link, []},
            permanent,
            5000,
            supervisor,
            [xprof_tracer_handler_sup]
        },
    Tracer =
        {xprof_tracer,
            {xprof_tracer, start_link, []},
            permanent,
            5000,
            worker,
            [xprof_tracer]
        },
    {ok, { {rest_for_one, 0, 1}, [TraceHandlerSup, Tracer]} }.
