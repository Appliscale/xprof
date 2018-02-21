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
-ifdef(COWBOY_VERSION_1).
-define(HANDLER_MOD, xprof_gui_cowboy1_handler).
-else.
-define(HANDLER_MOD, xprof_gui_cowboy2_handler).
-endif.

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
    Dispatch = cowboy_dispatch(?HANDLER_MOD),
    ?HANDLER_MOD:start_listener(?LISTENER, Port, Dispatch).

cowboy_dispatch(Mod) ->
    Routes =
        [{'_', [{"/api/:what", Mod, []},
                {"/build/[...]", cowboy_static, {priv_dir, ?APP, "build"}},
                {"/styles/[...]", cowboy_static, {priv_dir, ?APP, "styles"}},
                {"/img/[...]", cowboy_static, {priv_dir, ?APP, "img"}},
                {"/", cowboy_static, {priv_file, ?APP, "index.html"}}
               ]}],
    cowboy_router:compile(Routes).

stop_cowboy() ->
    cowboy:stop_listener(?LISTENER).
