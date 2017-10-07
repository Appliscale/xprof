%% @doc XProf GUI application callback
%% @end
-module(xprof_gui_app).

-behaviour(application).

%% Application callbacks
-export([start/2,
         stop/1]).

-define(APP, xprof_gui).
-define(DEF_WEB_IF_PORT, 7890).

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
    [{'_', [{"/api/:what", xprof_gui_cowboy1_handler, []},
            {"/build/[...]", cowboy_static, {priv_dir, ?APP, "build"}},
            {"/styles/[...]", cowboy_static, {priv_dir, ?APP, "styles"}},
            {"/img/[...]", cowboy_static, {priv_dir, ?APP, "img"}},
            {"/", cowboy_static, {priv_file, ?APP, "index.html"}}
           ]}].

stop_cowboy() ->
    cowboy:stop_listener(xprof_http_listener).
