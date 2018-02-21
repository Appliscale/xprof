%%% @doc Cowboy 2.x compatible HTTP handler
-module(xprof_gui_cowboy2_handler).

-ifndef(COWBOY_VERSION_1).

-behavior(cowboy_handler).

%% xprof_gui_app callback
-export([start_listener/3]).

%% Cowboy 2.x callback
-export([init/2]).

-define(HDR_JSON, #{<<"content-type">> => <<"application/json">>}).

%% In case an XHR receives no content with no content-type Firefox will emit
%% the following error: "XML Parsing Error: no root element found..."
%% As a workaround always return a content-type of octet-stream with
%% 204 No Content responses
-define(HDR_NO_CONTENT, #{<<"content-type">> => <<"application/octet-stream">>}).

%% xprof_gui_app callback

start_listener(Name, Port, Dispatch) ->
    cowboy:start_clear(Name, [{port, Port}],
                       #{env => #{dispatch => Dispatch}}).

%% Cowboy 2.x callback

init(Req0, State) ->
    What = cowboy_req:binding(what, Req0),
    Params = cowboy_req:parse_qs(Req0),
    Req =
        case xprof_gui_rest:handle_req(What, Params) of
            {StatusCode, Json} when is_integer(StatusCode), is_binary(Json) ->
                cowboy_req:reply(StatusCode, ?HDR_JSON, Json, Req0);
            StatusCode when is_integer(StatusCode) ->
                cowboy_req:reply(StatusCode, ?HDR_NO_CONTENT, Req0)
        end,
    {ok, Req, State}.

-endif.
