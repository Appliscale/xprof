%%% @doc HTTP server independent part of the REST API implementation
%%%
%%% == Autocomplete ==
%%%
%%% === /api/funs ===
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: ["MFA"] </li>
%%% </ul>
%%%
%%% Get loaded modules and functions (MFAs) that match the query string.
%%% Used for autocomplete suggestions on the GUI.
%%%
%%% === /api/get_callees ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: ["MFA"] </li>
%%% </ul>
%%%
%%% Get list of functions (MFAs) that are called by the specified function
%%% (MFA) based on static analysis (ie. not based on runtime information).
%%%
%%%
%%% == Monitoring functions ==
%%%
%%% === /api/mon_start ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "query" (""): the query string representing a XProf-flavoured match-spec </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 204: "" </li>
%%%   <li> 400: "" </li>
%%% </ul>
%%%
%%% Start monitoring based on the specified query string.
%%%
%%% === /api/mon_stop ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 204: "" </li>
%%% </ul>
%%%
%%% Stop monitoring the specified function (MFA).
%%%
%%% === /api/mon_get_all ===
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: [["mod", "fun", "arity", "query"]] </li>
%%% </ul>
%%%
%%% Return list of monitored functions.
%%% (The values of "mod", "fun" and "arity" can be used as params to calls to eg
%%% "/api/mon_stop" while "query" can be used to display the original query
%%% string).
%%%
%%% === /api/data ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%%   <li> "last_ts" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: [{"time": timestamp, "hitkey": number}] (where "histkey" is one of:
%%%        min, mean, median, max, stddev,
%%%        p25, p50, p75, p90, p99, p9999999, memsize, count) </li>
%%%   <li> 404: "" (the requested MFA is not monitored) </li>
%%% </ul>
%%%
%%% Return metrics gathered for the given function since the given
%%% timestamp. Each item contains a timestamp and the corresponding histogram
%%% metrics values.
%%%
%%% == Global trace status ==
%%%
%%% === /api/trace_set ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "spec" ("all"/"pause") </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 204: "" </li>
%%%   <li> 400: "" (if spec has invalid value) </li>
%%% </ul>
%%%
%%% Turn on or pause tracing of all processes.
%%%
%%% === /api/trace_status ===
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: {"status": "initialized"/"running"/"paused"/"overflow"} </li>
%%% </ul>
%%%
%%% Return current tracing state.
%%% (The `initialized' status is basically the same as `paused', additionally
%%%  meaning that no tracing was started yet since xprof was started)
%%%
%%% == Long call capturing ==
%%%
%%% === /api/capture ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%%   <li> "threshold" </li>
%%%   <li> "limit" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 202: {"capture_id": integer} </li>
%%%   <li> 404: "" (the requested MFA is not monitored)</li>
%%% </ul>
%%%
%%% Start capturing arguments and return values of function calls that lasted
%%% longer than the specified time threshold in ms. Stop after `limit' number of
%%% captured calls.
%%%
%%% === /api/capture_stop ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 204: "" </li>
%%%   <li> 404: "" (the requested MFA is not monitored or hasn't been captured yet) </li>
%%% </ul>
%%%
%%% Stop capturing long calls of the given function (MFA).
%%%
%%% === /api/capture_data ===
%%%
%%% Params:
%%% <ul>
%%%   <li> "mod" </li>
%%%   <li> "fun" </li>
%%%   <li> "arity" </li>
%%%   <li> "offset" </li>
%%% </ul>
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: {"capture_id": integer,
%%%              "threshold": integer,
%%%              "limit": integer,
%%%              "items": [Item],
%%%              "has_more": boolean}
%%%             where `Item' is
%%%              {"id": number,
%%%               "pid": string,
%%%               "call_time": number,
%%%               "args": string,
%%%               "res": string} </li>
%%%   <li> 404: "" (the requested MFA is not monitored) </li>
%%% </ul>
%%%
%%% Return captured arguments and return values.
%%%
%%% The `Offset' argument is the item index last seen by the caller, only items
%%% newer than that will be returned. An offset of 0 will return all data.
%%%
%%% The returned `HasMore' indicates whether capturing is still ongoing or it has
%%% been stopped either manually or by reaching the limit.
%%%
%%% == Syntax mode ==
%%%
%%% === /api/mode ===
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: {"mode": "erlang"/"elixir"} </li>
%%% </ul>
%%%
%%% Get syntax mode, if not set explicitely in the backend, it will be
%%% autodetected.
%%%
%%% @end

-module(xprof_gui_rest).

-export([handle_req/2]).


-spec handle_req(Path :: binary(), Params :: [{binary(), binary()}])
  -> StatusCode | {StatusCode, Body}
         when StatusCode :: integer(),
              Body :: binary().

%% @doc
handle_req(<<"funs">>, Params) ->
    Query = get_query(Params),
    Funs = xprof_core:get_matching_mfas_pp(Query),
    Json = jsone:encode(Funs),

    lager:debug("Returning ~b functions matching phrase \"~s\"", [length(Funs), Query]),

    {200, Json};

handle_req(<<"get_callees">>, Req) ->
    MFA = get_mfa(Req),
    Callees = xprof_core:get_called_funs_pp(MFA),
    Json = jsone:encode(Callees),
    {200, Json};

handle_req(<<"mon_start">>, Params) ->
    Query = get_query(Params),

    lager:info("Starting monitoring via web on '~s'~n", [Query]),

    case xprof_core:monitor_pp(Query) of
        ok ->
            204;
        {error, already_traced} ->
            204;
        _Error ->
            400
    end;

handle_req(<<"mon_stop">>, Params) ->
    MFA = {M, F, A} = get_mfa(Params),

    lager:info("Stopping monitoring via web on ~w:~w/~w~n",[M, F, A]),

    xprof_core:demonitor(MFA),
    204;

handle_req(<<"mon_get_all">>, _Params) ->
    Funs = xprof_core:get_all_monitored(),
    FunsArr = [[Mod, Fun, Arity, Query]
               || {{Mod, Fun, Arity}, Query} <- Funs],
    Json = jsone:encode(FunsArr),
    {200, Json};

handle_req(<<"data">>, Params) ->
    MFA = get_mfa(Params),
    LastTS = get_int(<<"last_ts">>, Params, 0),

    case xprof_core:get_data(MFA, LastTS) of
        {error, not_found} ->
            404;
        Vals ->
            Json = jsone:encode([{Val} || Val <- Vals]),
            {200, Json}
    end;

handle_req(<<"trace_set">>, Params) ->
    case proplists:get_value(<<"spec">>, Params) of
        <<"all">> ->
            xprof_core:trace(all),
            204;
        <<"pause">> ->
            xprof_core:trace(pause),
            204;
        Spec ->
            lager:info("Wrong spec for tracing: ~p",[Spec]),
            400
    end;

handle_req(<<"trace_status">>, _Params) ->
    {_, Status} = xprof_core:get_trace_status(),
    Json = jsone:encode({[{status, Status}]}),
    {200, Json};

handle_req(<<"capture">>, Params) ->
    MFA = {M, F, A} = get_mfa(Params),
    Threshold = get_int(<<"threshold">>, Params),
    Limit = get_int(<<"limit">>, Params),

    lager:info("Capture ~b calls to ~w:~w/~w~n exceeding ~b ms",
               [Limit, M, F, A, Threshold]),

    case xprof_core:capture(MFA, Threshold, Limit) of
        {ok, CaptureId} ->
            Json = jsone:encode({[{capture_id, CaptureId}]}),

            {200, Json};
        {error, not_found} ->
            404
    end;

handle_req(<<"capture_stop">>, Params) ->
    MFA = get_mfa(Params),

    lager:info("Stopping slow calls capturing for ~p", [MFA]),

    case xprof_core:capture_stop(MFA) of
        ok ->
            204;
        {error, not_found} ->
            404;
        {error, not_captured} ->
            404
    end;

handle_req(<<"capture_data">>, Params) ->
    MFA  = get_mfa(Params),
    Offset = get_int(<<"offset">>, Params, 0),

    case xprof_core:get_captured_data_pp(MFA, Offset) of
        {error, not_found} ->
            404;
        {ok, {Id, Threshold, Limit, HasMore}, Items} ->
            Json = jsone:encode({[{capture_id, Id},
                                  {threshold, Threshold},
                                  {limit, Limit},
                                  {items, Items},
                                  {has_more, HasMore}]}),
            {200, Json}
    end;

handle_req(<<"mode">>, _Params) ->
    Mode = xprof_core:get_mode(),
    Json = jsone:encode({[{mode, Mode}]}),
    {200, Json};

handle_req(<<"fav_enabled">>, _Params) ->
    FavouritesEnabled = xprof_gui_favourites_config:is_enabled(),
    Json = jsone:encode({[{enabled, FavouritesEnabled}]}),
    {200, Json};

handle_req(<<"fav_add">>, Params) ->
    Query = get_query(Params),
    Funs = xprof_gui_favourites:add(Query),
    Json = jsone:encode(Funs),
    {200, Json};

handle_req(<<"fav_remove">>, Params) ->
    Query = get_query(Params),
    Funs = xprof_gui_favourites:remove(Query),
    Json = jsone:encode(Funs),
    {200, Json};

handle_req(<<"fav_get_all">>, _Params) ->
    Funs = xprof_gui_favourites:get_all(),
    Json = jsone:encode(Funs),
    {200, Json}.

%% Helpers

-spec get_mfa([{binary(), binary() | true}]) -> xprof_core:mfa_id().
get_mfa(Params) ->
    {binary_to_atom(proplists:get_value(<<"mod">>, Params), latin1),
     binary_to_atom(proplists:get_value(<<"fun">>, Params), latin1),
     case proplists:get_value(<<"arity">>, Params) of
         <<"_">> -> '_';
         Arity -> binary_to_integer(Arity)
     end}.

-spec get_query([{binary(), binary() | true}]) -> binary().
get_query(Params) ->
    proplists:get_value(<<"query">>, Params, <<"">>).

-spec get_int(binary(), [{binary(), binary() | true}]) -> integer().
get_int(Key, Params) ->
    {_, BinValue} = lists:keyfind(Key, 1, Params),
    binary_to_integer(BinValue).

-spec get_int(binary(), [{binary(), binary() | true}], integer()) -> integer().
get_int(Key, Params, Default) ->
    case lists:keyfind(Key, 1, Params) of
        {_, BinValue} ->
            binary_to_integer(BinValue);
        _ ->
            Default
    end.