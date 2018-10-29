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
    maybe_start_favourites(),
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
    StaticDir = get_static_dir(),
    Index = filename:join(StaticDir, "index.html"),
    Routes =
        [{'_', [{"/api/:what", Mod, []},
                {"/", cowboy_static, {priv_file, ?APP, Index}},
                {"/[...]", cowboy_static, {priv_dir, ?APP, StaticDir}}
               ]}],
    cowboy_router:compile(Routes).

%% Only for development
%% If `build-dev' directory exists serve static assets from there.
%% It should not be present when XProf is used as a lib within another
%% application.
get_static_dir() ->
    case filelib:is_dir(filename:join(code:priv_dir(?APP), "build-dev")) of
        true ->
            "build-dev";
        false ->
            "build"
    end.

stop_cowboy() ->
    cowboy:stop_listener(?LISTENER).

maybe_start_favourites() ->
    case xprof_gui_favourites_config:is_enabled() of
        false ->
            %% do nothing
            ok;
        true ->
            {ok, _} = xprof_gui_favourites_sup:start_link()
    end.
