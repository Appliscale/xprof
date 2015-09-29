%% @doc xprof public API
%% @end
-module(xprof_app).

-behaviour(application).

-include("xprof.hrl").

%% Application callbacks
-export([start/2,stop/1]).

%% API

start(_StartType, _StartArgs) ->
    init_ets(),
    xprof_tracer:start(),
    start_cowboy(),
    xprof_sup:start_link().

stop(_State) ->
    stop_cowboy(),
    xprof_tracer:stop(),
    finalize_ets(),
    ok.

%% Internal functions

start_cowboy() ->
    Port = application:get_env(?APP, port, ?DEF_WEB_IF_PORT),
    Dispatch = cowboy_router:compile(cowboy_routes()),
    cowboy:start_http(nperf_http_listener, 100, [{port, Port}],
                      [{env, [{dispatch, Dispatch}]}]).

cowboy_routes() ->
    [{'_', [{"/api/:what", xprof_web_handler, []},
            {"/build/[...]", cowboy_static, {priv_dir, ?APP, "build"}},
            {"/", cowboy_static, {priv_file, ?APP, "index.html"}}
           ]}].

stop_cowboy() ->
    cowboy:stop_listener(nperf_http_listener).

init_ets() ->
    ets:new(nperf_hists, [named_table, {read_concurrency, true}, public]).

finalize_ets() ->
    ets:delete(nperf_hists).
