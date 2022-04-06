%%% @doc HTTP server independent part of the REST API implementation
%%%
%%% == Autocomplete ==
%%%
%%% === /api/funs ===
%%%
%%% Returns:
%%% <ul>
%%%   <li> 200: {"expansion": "commonPrefix",
%%%              "matches": [{"expansion": "prefix",
%%%                           "label": "suggestionLabel"},
%%%                          {...},...]}
%%%   </li>
%%% </ul>
%%%
%%% Get expansion suggestions for the given possibly incomplete query.
%%% Used for autocomplete suggestions on the GUI.
%%% "commonPrefix" can be used to append to the query if no suggestion is
%%% selected.
%%% "prefix" can be appended to the query if the given suggestion is selected.
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
%%%   <li> 204 "" </li>
%%%   <li> 400: {"message": "string"} (there was some error processing the query string) </li>
%%%   <li> 409: {"message": "string"} (the requested MFA is already monitored) </li>
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
%%%   <li> 200: [{"mfa": ["mod", "fun", "arity"],
%%%               "query": "queryvalue",
%%%               "graph_type": "percentiles"/"grid"]] </li>
%%% </ul>
%%%
%%% Return list of monitored functions.
%%% (The values of "mod", "fun" and "arity" can be used as params to calls to eg
%%% "/api/mon_stop" while "queryvalue" can be used to display the original query
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
%%%   <li> 200: [{"time": timestamp, "histkey": number}] (where "histkey" is one of:
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
%%% Get syntax mode, if not set explicitly in the backend, it will be
%%% autodetected.
%%%
%%% @end

-module(xprof_gui_rest).

-export([handle_req/2]).


-spec handle_req(Path :: binary(), Params :: [{binary(), binary()}])
  -> StatusCode | {StatusCode, Body}
         when StatusCode :: integer(),
              Body :: binary().
handle_req(What, Params) ->
    try do_handle_req(What, Params)
    catch C:E ->
            error_logger:error_msg(
              "~p: Error handling REST API request \"~s\" ~p ~p:~p",
              [?MODULE, What, Params, C, E]),
            500
    end.

do_handle_req(<<"funs">>, Params) ->
    Query = get_query(Params),

    {CommonPrefix, Funs} = xprof_core:expand_query(Query),
    Data = {[{expansion, CommonPrefix},
             {matches, [{[{expansion, Exp},{label, Label}]}||{Exp, Label} <- Funs]}
            ]},
    Json = xprof_gui_json:encode(Data),

    {200, Json};

do_handle_req(<<"get_callees">>, Req) ->
    MFA = get_mfa(Req),
    Callees = xprof_core:get_called_funs_pp(MFA),
    Json = xprof_gui_json:encode(Callees),
    {200, Json};

do_handle_req(<<"mon_start">>, Params) ->
    Query = get_query(Params),

    case xprof_core:monitor_pp(Query) of
        ok ->
            204;
        {error, already_traced} ->
            Data = {[{message, <<"The requested function is already monitored">>}]},
            Json = xprof_gui_json:encode(Data),
            {409, Json};
        {error, Msg} ->
            Data = {[{message, unicode:characters_to_binary(Msg)}]},
            Json = xprof_gui_json:encode(Data),
            {400, Json}
    end;

do_handle_req(<<"mon_stop">>, Params) ->
    MFA = get_mfa(Params),

    xprof_core:demonitor(MFA),
    204;

do_handle_req(<<"mon_get_all">>, _Params) ->
    Funs = xprof_core:get_all_monitored(),
    FunsArr = [{[{<<"mfa">>, [Mod, Fun, Arity]},
                 {<<"query">>, Query},
                 {<<"graph_type">>, case Query of
                                        <<"#argdist ", _/binary>> -> <<"grid">>;
                                        _ -> <<"percentiles">>
                                    end}
                ]}
               || {{Mod, Fun, Arity}, Query} <- Funs],
    Json = xprof_gui_json:encode(FunsArr),
    {200, Json};

do_handle_req(<<"data">>, Params) ->
    MFA = get_mfa(Params),
    LastTS = get_int(<<"last_ts">>, Params, 0),

    case xprof_core:get_data_pp(MFA, LastTS) of
        {error, not_found} ->
            404;
        Vals ->
            Json = xprof_gui_json:encode([{Val} || Val <- Vals]),
            {200, Json}
    end;

do_handle_req(<<"trace_set">>, Params) ->
    case proplists:get_value(<<"spec">>, Params) of
        <<"all">> ->
            xprof_core:trace(all),
            204;
        <<"pause">> ->
            xprof_core:trace(pause),
            204;
        Spec ->
            error_logger:warning_msg("~p: Wrong spec for tracing: ~p", [?MODULE, Spec]),
            400
    end;

do_handle_req(<<"trace_status">>, _Params) ->
    {_, Status} = xprof_core:get_trace_status(),
    Json = xprof_gui_json:encode({[{status, Status}]}),
    {200, Json};

do_handle_req(<<"capture">>, Params) ->
    MFA = get_mfa(Params),
    Threshold = get_int(<<"threshold">>, Params),
    Limit = get_int(<<"limit">>, Params),

    case xprof_core:capture(MFA, Threshold, Limit) of
        {ok, CaptureId} ->
            Json = xprof_gui_json:encode({[{capture_id, CaptureId}]}),

            {200, Json};
        {error, not_found} ->
            404
    end;

do_handle_req(<<"capture_stop">>, Params) ->
    MFA = get_mfa(Params),

    case xprof_core:capture_stop(MFA) of
        ok ->
            204;
        {error, not_found} ->
            404;
        {error, not_captured} ->
            404
    end;

do_handle_req(<<"capture_data">>, Params) ->
    MFA  = get_mfa(Params),
    Offset = get_int(<<"offset">>, Params, 0),

    case xprof_core:get_captured_data_pp(MFA, Offset) of
        {error, not_found} ->
            404;
        {ok, {Id, Threshold, Limit, HasMore}, Items} ->
            Data = {[{capture_id, Id},
                     {threshold, Threshold},
                     {limit, Limit},
                     {items, Items},
                     {has_more, HasMore}]},
            Json = xprof_gui_json:encode(Data),
            {200, Json}
    end;

do_handle_req(<<"mode">>, _Params) ->
    Mode = xprof_core:get_mode(),
    Json = xprof_gui_json:encode({[{mode, Mode}]}),
    {200, Json};

do_handle_req(<<"fav_enabled">>, _Params) ->
    FavouritesEnabled = xprof_gui_favourites_config:is_enabled(),
    Json = xprof_gui_json:encode({[{enabled, FavouritesEnabled}]}),
    {200, Json};

do_handle_req(<<"fav_add">>, Params) ->
    Query = get_query(Params),
    Funs = xprof_gui_favourites:add(Query),
    Json = xprof_gui_json:encode(Funs),
    {200, Json};

do_handle_req(<<"fav_remove">>, Params) ->
    Query = get_query(Params),
    Funs = xprof_gui_favourites:remove(Query),
    Json = xprof_gui_json:encode(Funs),
    {200, Json};

do_handle_req(<<"fav_get_all">>, _Params) ->
    Funs = xprof_gui_favourites:get_all(),
    Json = xprof_gui_json:encode(Funs),
    {200, Json}.

%% Helpers

-spec get_mfa([{binary(), binary() | true}]) -> xprof_core:mfa_id().
get_mfa(Params) ->
    {binary_to_atom(proplists:get_value(<<"mod">>, Params), latin1),
     binary_to_atom(proplists:get_value(<<"fun">>, Params), latin1),
     binary_to_integer(proplists:get_value(<<"arity">>, Params))}.

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
