%%% @doc Umbrella application wrapping both the tracing core and GUI of XProf -
%%% the visual profiler for BEAM languages
%%% @end
-module(xprof).

%% Convenience functions
-export([start/0]).

%% Convenience functions

%% @doc Start all components of XProf.
-spec start() -> {ok, [StartedApp :: atom()]} | {error, Reason :: term()}.
start() ->
    application:ensure_all_started(xprof).
