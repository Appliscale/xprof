%% @doc xprof top level supervisor.
-module(xprof_core_sup).

-behaviour(supervisor).

%% API
-export([start_link/0]).

%% Supervisor callbacks
-export([init/1]).

-define(SERVER, ?MODULE).
-define(CHILD(Mod, Type),
        {Mod,
         {Mod, start_link, []},
         permanent,
         5000,
         Type,
         [Mod]
        }).

%% API functions

start_link() ->
    supervisor:start_link({local, ?SERVER}, ?MODULE, []).

%% Supervisor callbacks

init([]) ->
    RecordStore = ?CHILD(xprof_core_records, worker),
    TraceHandlerSup = ?CHILD(xprof_core_trace_handler_sup, supervisor),
    Tracer = ?CHILD(xprof_core_tracer, worker),
    {ok, { {rest_for_one, 0, 1}, [RecordStore, TraceHandlerSup, Tracer]} }.
