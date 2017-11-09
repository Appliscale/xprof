-module(xprof_gui_cowboy1_handler).

-export([init/3,handle/2,terminate/3]).

-behavior(cowboy_http_handler).

%% In case an XHR receives no content with no content-type Firefox will emit
%% the following error: "XML Parsing Error: no root element found..."
%% As a workaround always return a content-type of octet-stream with
%% 204 No Content responses
-define(HDR_NO_CONTENT, [{<<"Content-type">>, <<"application/octet-stream">>}]).

%% Cowboy callbacks

init(_Type, Req, _Opts) ->
    {ok, Req, no_state}.

handle(Req, State) ->
    {What,_} = cowboy_req:binding(what, Req),
    handle_req(What, Req, State).

terminate(_Reason, _Req, _State) ->
    ok.

%% Private

%% Handling different HTTP requests

handle_req(<<"funs">>, Req, State) ->
    Query = get_query(Req),

    Funs = xprof_core:get_matching_mfas_pp(Query),
    Json = jsone:encode(Funs),

    lager:debug("Returning ~b functions matching phrase \"~s\"",
                [length(Funs), Query]),

    {ok, Req2} = cowboy_req:reply(200,
                                  [{<<"content-type">>,
                                    <<"application/json">>}],
                                  Json,
                                  Req),
    {ok, Req2, State};

handle_req(<<"mon_start">>, Req, State) ->
    Query = get_query(Req),
    lager:info("Starting monitoring via web on '~s'~n", [Query]),

    {ok, ResReq} =
        case xprof_core:monitor_pp(Query) of
            ok ->
                cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
            {error, already_traced} ->
                cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
            _Error ->
                cowboy_req:reply(400, Req)
        end,
    {ok, ResReq, State};


handle_req(<<"mon_stop">>, Req, State) ->
    MFA = {M, F, A} = get_mfa(Req),

    lager:info("Stopping monitoring via web on ~w:~w/~w~n",[M, F, A]),

    xprof_core:demonitor(MFA),
    {ok, ResReq} = cowboy_req:reply(204, ?HDR_NO_CONTENT, Req),
    {ok, ResReq, State};

handle_req(<<"mon_get_all">>, Req, State) ->
    Funs = xprof_core:get_all_monitored(),
    FunsArr = [[Mod, Fun, Arity, Query]
               || {{Mod, Fun, Arity}, Query} <- Funs],
    Json = jsone:encode(FunsArr),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),
    {ok, ResReq, State};

handle_req(<<"data">>, Req, State) ->
    MFA = get_mfa(Req),
    {LastTS, _} = cowboy_req:qs_val(<<"last_ts">>, Req, <<"0">>),

    {ok, ResReq} =
        case xprof_core:get_data(MFA, binary_to_integer(LastTS)) of
            {error, not_found} ->
                cowboy_req:reply(404, Req);
            Vals ->
                Json = jsone:encode([{Val} || Val <- Vals]),

                cowboy_req:reply(200,
                                 [{<<"content-type">>,
                                   <<"application/json">>}],
                                 Json, Req)
        end,
    {ok, ResReq, State};

handle_req(<<"get_callees">>, Req, State) ->
    MFA = get_mfa(Req),
    Callees = xprof_core:get_called_funs_pp(MFA),
    Json = jsone:encode(Callees),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),
    {ok, ResReq, State};

handle_req(<<"trace_set">>, Req, State) ->
    {Spec, _} = cowboy_req:qs_val(<<"spec">>, Req),

    {ok, ResReq} = case lists:member(Spec, [<<"all">>, <<"pause">>]) of
                       true ->
                           xprof_core:trace(list_to_atom(binary_to_list(Spec))),
                           cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
                       false ->
                           lager:info("Wrong spec for tracing: ~p",[Spec]),
                           cowboy_req:reply(400, Req)
                   end,
    {ok, ResReq, State};

handle_req(<<"trace_status">>, Req, State) ->
    {_, Status} = xprof_core:get_trace_status(),
    Json = jsone:encode({[{status, Status}]}),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),

    {ok, ResReq, State};

handle_req(<<"capture">>, Req, State) ->
    MFA = {M,F,A} = get_mfa(Req),
    {ThresholdStr, _} = cowboy_req:qs_val(<<"threshold">>, Req),
    {LimitStr, _} = cowboy_req:qs_val(<<"limit">>, Req),
    Threshold = binary_to_integer(ThresholdStr),
    Limit = binary_to_integer(LimitStr),

    lager:info("Capture ~b calls to ~w:~w/~w~n exceeding ~b ms",
               [Limit, M, F, A, Threshold]),

    {ok, CaptureId} = xprof_core:capture(MFA, Threshold, Limit),
    Json = jsone:encode({[{capture_id, CaptureId}]}),

    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}], Json, Req),
    {ok, ResReq, State};

handle_req(<<"capture_stop">>, Req, State) ->
    MFA = get_mfa(Req),

    lager:info("Stopping slow calls capturing for ~p", [MFA]),

    {ok, ResReq} =
        case xprof_core:capture_stop(MFA) of
            ok ->
                cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
            {error, not_found} ->
                cowboy_req:reply(404, Req)
        end,
    {ok, ResReq, State};

handle_req(<<"capture_data">>, Req, State) ->
    MFA  = get_mfa(Req),
    {OffsetStr, _} = cowboy_req:qs_val(<<"offset">>, Req),
    Offset = binary_to_integer(OffsetStr),

    {ok, ResReq} =
        case xprof_core:get_captured_data_pp(MFA, Offset) of
            {error, not_found} ->
                cowboy_req:reply(404, Req);
            {ok, {Id, Threshold, Limit, HasMore}, Items} ->
                Json = jsone:encode({[{capture_id, Id},
                                      {threshold, Threshold},
                                      {limit, Limit},
                                      {items, Items},
                                      {has_more, HasMore}]}),
                cowboy_req:reply(200,
                                 [{<<"content-type">>,
                                   <<"application/json">>}],
                                 Json, Req)
        end,
    {ok, ResReq, State};

handle_req(<<"mode">>, Req, State) ->
    Mode = xprof_core:get_mode(),
    Json = jsone:encode({[{mode, Mode}]}),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),
    {ok, ResReq, State}.

%% Helpers

-spec get_mfa(cowboy:req()) -> xprof_core:mfa_id().
get_mfa(Req) ->
    {Params, _} = cowboy_req:qs_vals(Req),
    {list_to_atom(binary_to_list(proplists:get_value(<<"mod">>, Params))),
     list_to_atom(binary_to_list(proplists:get_value(<<"fun">>, Params))),
     case proplists:get_value(<<"arity">>, Params) of
         <<"_">> -> '_';
         Arity -> binary_to_integer(Arity)
     end}.

-spec get_query(cowboy:req()) -> binary().
get_query(Req) ->
    {Query, _} = cowboy_req:qs_val(<<"query">>, Req, <<"">>),
    Query.
