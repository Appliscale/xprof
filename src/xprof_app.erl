%% @doc xprof public API
%% @end
-module(xprof_app).

-behaviour(application).

-include("xprof.hrl").

%% Application callbacks
-export([start/2,stop/1]).

%% API

start(_StartType, _StartArgs) ->
    case start_cowboy() of
        {ok, _} ->
            xprof_sup:start_link();
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
    cowboy:start_clear(xprof_http_listener, [{port, Port}], #{env => #{dispatch => Dispatch}}).

cowboy_routes() ->
    [{'_', [{"/api/:what", xprof_web_handler, []},
            {"/build/[...]", cowboy_static, {priv_dir, ?APP, "build"}},
            {"/styles/[...]", cowboy_static, {priv_dir, ?APP, "styles"}},
            {"/img/[...]", cowboy_static, {priv_dir, ?APP, "img"}},
            {"/", cowboy_static, {priv_file, ?APP, "index.html"}}
           ]}].

stop_cowboy() ->
    cowboy:stop_listener(xprof_http_listener).
