%%% @doc Supervisor
-module(xprof_gui_favourites_sup).

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
    RestartStrategy = one_for_one,
    MaxRestarts = 10,
    MaxSecondsBetweenRestarts = 1,

    SupFlags = {RestartStrategy, MaxRestarts, MaxSecondsBetweenRestarts},

    Child = {
        xprof_gui_favourites,
            {xprof_gui_favourites, start_link, []},
            permanent,
            5000,
            worker,
            [xprof_gui_favourites]
        },

    {ok, {SupFlags, [Child]}}.
