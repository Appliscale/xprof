%% @doc XProf GUI application callback
%% @end
-module(xprof_gui_app).

-behaviour(application).

%% Application callbacks
-export([start/2,
         stop/1]).

-define(APP, xprof_gui).
-define(DEF_WEB_IF_PORT, 7890).
-define(LISTENER, xprof_http_listener).

%% Application callbacks

start(_StartType, _StartArgs) ->
    case start_cowboy() of
        {ok, _} ->
            {ok, self()};
        {error, _} = Error ->
            Error
    end.

stop(_State) ->
    stop_cowboy(),
    ok.

%% Internal functions

start_cowboy() ->
    Port = application:get_env(?APP, port, ?DEF_WEB_IF_PORT),
    Dispatch = cowboy_dispatch(xprof_gui_cowboy1_handler),
    xprof_gui_cowboy1_handler:start_listener(?LISTENER, Port, Dispatch).

cowboy_dispatch(Mod) ->
    Routes =
        [{'_', [{"/api/:what", Mod, []},
                {"/", cowboy_static, {priv_file, ?APP, "build/index.html"}},
                {"/[...]", cowboy_static, {priv_dir, ?APP, "build"}}
               ]}],
    cowboy_router:compile(Routes).

stop_cowboy() ->
    cowboy:stop_listener(?LISTENER).
