%% @doc XProf visual profiler
-module(xprof).

-export([start/0, stop/0]).

-include("xprof.hrl").

start() ->
    application:ensure_all_started(?APP).

stop() ->
    application:stop(?APP).
