-module(xprof_web_handler).

-export([init/2]).

-behavior(cowboy_handler).

%% In case an XHR receives no content with no content-type Firefox will emit
%% the following error: "XML Parsing Error: no root element found..."
%% As a workaround always return a content-type of octet-stream with
%% 204 No Content responses
-define(HDR_NO_CONTENT, #{<<"Content-type">> => <<"application/octet-stream">>}).

%% Cowboy callbacks

init(Req0, State) ->
    What = cowboy_req:binding(what, Req0),
    {ok, Req} = handle_req(What, Req0),
    {ok, Req, State}.


%% Private

%% Handling different HTTP requests

handle_req(<<"funs">>, Req) ->
    {Query, _} = cowboy_req:qs_val(<<"query">>, Req, <<"">>),

    Funs = xprof_vm_info:get_available_funs(Query),
    Json = jsone:encode(Funs),

    lager:debug("Returning ~b functions matching phrase \"~s\"", [length(Funs), Query]),

    cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req);
handle_req(<<"mon_start">>, Req) ->
    Query = get_query(Req),
    lager:info("Starting monitoring via web on '~s'~n", [Query]),
    case xprof_tracer:monitor(Query) of
        ok ->
            cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
        {error, already_traced} ->
            cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
        _Error ->
            cowboy_req:reply(400, Req)
    end;
handle_req(<<"mon_stop">>, Req) ->
    MFA = {M,F,A} = get_mfa(Req),

    lager:info("Stopping monitoring via web on ~w:~w/~w~n",[M,F,A]),

    xprof_tracer:demonitor(MFA),
    cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
handle_req(<<"mon_get_all">>, Req) ->
    Funs = xprof_tracer:all_monitored(),
    FunsArr = [[Mod, Fun, Arity, Query]
               || {{Mod, Fun, Arity}, Query} <- Funs],
    Json = jsone:encode(FunsArr),
    cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req);
handle_req(<<"data">>, Req) ->
    MFA = get_mfa(Req),
    {LastTS, _} = cowboy_req:qs_val(<<"last_ts">>, Req, <<"0">>),

    case xprof_tracer:data(MFA, binary_to_integer(LastTS)) of
        {error, not_found} ->
            cowboy_req:reply(404, Req);
        Vals ->
            Json = jsone:encode([{Val} || Val <- Vals]),

            cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req)
    end;
handle_req(<<"trace_set">>, Req) ->
    {Spec, _} = cowboy_req:qs_val(<<"spec">>, Req),
    case lists:member(Spec, [<<"all">>, <<"pause">>]) of
        true ->
            xprof_tracer:trace(list_to_atom(binary_to_list(Spec))),
            cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
        false ->
            lager:info("Wrong spec for tracing: ~p",[Spec]),
            cowboy_req:reply(400, Req)
    end;
handle_req(<<"trace_status">>, Req) ->
    {_, Status} = xprof_tracer:trace_status(),
    Json = jsone:encode({[{status, Status}]}),
    cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req);
handle_req(<<"capture">>, Req) ->
    MFA = {M,F,A} = get_mfa(Req),
    {ThresholdStr, _} = cowboy_req:qs_val(<<"threshold">>, Req),
    {LimitStr, _} = cowboy_req:qs_val(<<"limit">>, Req),
    Threshold = binary_to_integer(ThresholdStr),
    Limit = binary_to_integer(LimitStr),

    lager:info("Capture ~b calls to ~w:~w/~w~n exceeding ~b ms",
               [Limit, M, F, A, Threshold]),

    {ok, CaptureId} = xprof_tracer_handler:capture(MFA, Threshold, Limit),
    Json = jsone:encode({[{capture_id, CaptureId}]}),

    cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req);
handle_req(<<"capture_stop">>, Req) ->
    MFA = get_mfa(Req),

    lager:info("Stopping slow calls capturing for ~p", [MFA]),

    case xprof_tracer_handler:capture_stop(MFA) of
        ok ->
            cowboy_req:reply(204, ?HDR_NO_CONTENT, Req);
        {error, not_found} ->
            cowboy_req:reply(404, Req)
    end;
handle_req(<<"capture_data">>, Req) ->
    MFA  = get_mfa(Req),
    {OffsetStr, _} = cowboy_req:qs_val(<<"offset">>, Req),
    Offset = binary_to_integer(OffsetStr),
    case xprof_tracer_handler:get_captured_data(MFA, Offset) of
        {error, not_found} ->
            cowboy_req:reply(404, Req);
        {ok, {Id, Threshold, Limit, OriginalLimit}, Items} ->
            ModeCb = xprof_lib:get_mode_cb(),
            ItemsJson = [{args_res2proplist(Item, ModeCb)} || Item <- Items],
            Json = jsone:encode(#{capture_id => Id,
                                  threshold => Threshold,
                                  limit => OriginalLimit,
                                  items => ItemsJson,
                                  has_more => Offset + length(Items) < Limit}),
            cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req)
    end;
handle_req(<<"mode">>, Req) ->
    Mode = xprof_lib:get_mode(),
    Json = jsone:encode(#{mode => Mode}),
    cowboy_req:reply(200, #{<<"content-type">> => <<"application/json">>}, Json, Req).

%% Helpers

-spec get_mfa(cowboy:req()) -> xprof:mfa_id().
get_mfa(Req) ->
    Params = cowboy_req:parse_qs(Req),
    {binary_to_atom(proplists:get_value(<<"mod">>, Params), latin1),
     binary_to_atom(proplists:get_value(<<"fun">>, Params), latin1),
     case proplists:get_value(<<"arity">>, Params) of
         <<"_">> -> '_';
         Arity -> binary_to_integer(Arity)
     end}.

-spec get_query(cowboy:req()) -> string().
get_query(Req) ->
    Params = cowboy_req:parse_qs(Req),
    binary_to_list(proplists:get_value(<<"query">>, Params)).

args_res2proplist([Id, Pid, CallTime, Args, Res], ModeCb) ->
    [{id, Id},
     {pid, ModeCb:fmt_term(Pid)},
     {call_time, CallTime},
     {args, ModeCb:fmt_term(Args)},
     {res, format_result(Res, ModeCb)}].

format_result({return_from, Term}, ModeCb) ->
    ModeCb:fmt_term(Term);
format_result({exception_from, {Class, Reason}}, ModeCb) ->
    ModeCb:fmt_exception(Class, Reason).
