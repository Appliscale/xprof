%% @doc XProf Core application callback
%% @end
-module(xprof_core_app).

-behaviour(application).

%% Application callbacks
-export([start/2,
         stop/1]).

%% Application callbacks

start(_StartType, _StartArgs) ->
    xprof_core_sup:start_link().

stop(_State) ->
    ok.
