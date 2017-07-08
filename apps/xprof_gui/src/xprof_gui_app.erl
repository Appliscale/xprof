%% @doc XProf GUI application callback
%% @end
-module(xprof_gui_app).

-behaviour(application).

%% Convenience API
-export([start_all/0,
         stop_all/0]).

%% Application callbacks
-export([start/2,
         stop/1]).

-define(APP, xprof_gui).
-define(DEF_WEB_IF_PORT, 7890).

%% Convenience API

start_all() ->
    case application:ensure_all_started(xprof_core) of
        {ok, StartedCore} ->
            case application:ensure_all_started(xprof_gui) of
                {ok, StartedGUI} ->
                    {ok, StartedCore ++ StartedGUI};
                {error, _} = Error ->
                    [application:stop(App) || App <- StartedCore],
                    Error
            end;
        {error, _} = Error ->
            Error
    end.

stop_all() ->
    ok = application:stop(xprof_gui),
    ok = application:stop(xprof_core).

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
    Dispatch = cowboy_router:compile(cowboy_routes()),
    cowboy:start_http(xprof_http_listener, 100, [{port, Port}],
                      [{env, [{dispatch, Dispatch}]}]).

cowboy_routes() ->
    [{'_', [{"/api/:what", xprof_web_handler, []},
            {"/build/[...]", cowboy_static, {priv_dir, ?APP, "build"}},
            {"/styles/[...]", cowboy_static, {priv_dir, ?APP, "styles"}},
            {"/img/[...]", cowboy_static, {priv_dir, ?APP, "img"}},
            {"/", cowboy_static, {priv_file, ?APP, "index.html"}}
           ]}].

stop_cowboy() ->
    cowboy:stop_listener(xprof_http_listener).
