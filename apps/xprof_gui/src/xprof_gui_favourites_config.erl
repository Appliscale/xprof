-module(xprof_gui_favourites_config).

-define(APP, xprof_gui).
-define(DEFAULT_FAVOURITES_LOCATION, "./favourites.cfg").

-export([is_enabled/0, load_queries/0, save_queries/1]).

load_queries() ->
    File = get_config_file(),
    case file:consult(File) of
        {ok, Queries} -> {ok, Queries};
        {error, Reason} ->
            lager:warning("Couldn't open file: ~p. Using empty favourites list.", [Reason]),
            {ok, []}
    end.

save_queries(Queries) ->
    File = get_config_file(),
    Formatted = lists:map(fun(Q) -> io_lib:format("~tp.~n", [Q]) end, Queries),
    ok = file:write_file(File, Formatted).

get_config_file() ->
    application:get_env(?APP, favourites_config, ?DEFAULT_FAVOURITES_LOCATION).

is_enabled() ->
    application:get_env(?APP, favourites_enabled, true).