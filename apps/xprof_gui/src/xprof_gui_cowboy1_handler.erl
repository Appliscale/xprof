%%% @doc Cowboy 1.x compatible HTTP handler
-module(xprof_gui_cowboy1_handler).

-behavior(cowboy_http_handler).

%% xprof_gui_app callback
-export([start_listener/3]).

%% Cowboy 1.x callbacks
-export([init/3,
         handle/2,
         terminate/3
        ]).

-define(HDR_JSON, [{<<"content-type">>, <<"application/json">>}]).

%% In case an XHR receives no content with no content-type Firefox will emit
%% the following error: "XML Parsing Error: no root element found..."
%% As a workaround always return a content-type of octet-stream with
%% 204 No Content responses
-define(HDR_NO_CONTENT, [{<<"content-type">>, <<"application/octet-stream">>}]).

%% xprof_gui_app callback

start_listener(Name, Port, Dispatch) ->
    cowboy:start_http(Name, 100, [{port, Port}],
                      [{env, [{dispatch, Dispatch}]}]).

%% Cowboy 1.x callbacks

init(_Type, Req, _Opts) ->
    {ok, Req, no_state}.

handle(Req0, State) ->
    {What, _} = cowboy_req:binding(what, Req0),
    {Params, _} = cowboy_req:qs_vals(Req0),
    {ok, Req} =
        case xprof_gui_rest:handle_req(What, Params) of
            {StatusCode, Json} when is_integer(StatusCode), is_binary(Json) ->
                cowboy_req:reply(StatusCode, ?HDR_JSON, Json, Req0);
            StatusCode when is_integer(StatusCode) ->
                cowboy_req:reply(StatusCode, ?HDR_NO_CONTENT, Req0)
        end,

    {ok, Req, State}.

terminate(_Reason, _Req, _State) ->
    ok.
