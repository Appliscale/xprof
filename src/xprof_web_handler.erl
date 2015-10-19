-module(xprof_web_handler).

-export([init/3,handle/2,terminate/3]).

-behavior(cowboy_http_handler).

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
    {Query, _} = cowboy_req:qs_val(<<"query">>, Req, <<"">>),

    Funs = lists:sort(xprof_vm_info:get_available_funs(Query)),
    Json = jiffy:encode(Funs),

    lager:debug("Returning ~b functions matching phrase \"~s\"",
                [length(Funs), Query]),

    {ok, Req2} = cowboy_req:reply(200,
                                  [{<<"content-type">>,
                                    <<"application/json">>}],
                                  Json,
                                  Req),
    {ok, Req2, State};
handle_req(<<"mon_start">>, Req, State) ->
    MFA = {M,F,A} = get_mfa(Req),

    lager:info("Starting monitoring via web on ~w:~w:~b~n",[M,F,A]),

    xprof_tracer:monitor(MFA),
    {ok, Req, State};


handle_req(<<"mon_stop">>, Req, State) ->
    MFA = {M,F,A} = get_mfa(Req),

    lager:info("Stopping monitoring via web on ~w:~w:~b~n",[M,F,A]),

    xprof_tracer:demonitor(MFA),
    {ok, Req, State};

handle_req(<<"mon_get_all">>, Req, State) ->
    Funs = xprof_tracer:all_monitored(),
    FunsArr = [tuple_to_list(MFA) || MFA <- Funs],
    Json = jiffy:encode(FunsArr),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),
    {ok, ResReq, State};

handle_req(<<"data">>, Req, State) ->
    MFA = get_mfa(Req),
    {LastTS, _} = cowboy_req:qs_val(<<"last_ts">>, Req, <<"0">>),

    {ok, ResReq} =
        case xprof_tracer:data(MFA, binary_to_integer(LastTS)) of
            {error, not_found} ->
                cowboy_req:reply(404, Req);
            Vals ->
                Json = jiffy:encode([{Val} || Val <- Vals]),

                cowboy_req:reply(200,
                                 [{<<"content-type">>,
                                   <<"application/json">>}],
                                 Json, Req)
        end,
    {ok, ResReq, State};

handle_req(<<"trace_set">>, Req, State) ->
    {Spec, _} = cowboy_req:qs_val(<<"spec">>, Req),

    {ok, ResReq} = case lists:member(Spec, [<<"all">>, <<"pause">>]) of
                       true ->
                           xprof_tracer:trace(list_to_atom(binary_to_list(Spec))),
                           cowboy_req:reply(200, Req);
                       false ->
                           lager:info("Wrong spec for tracing: ~p",[Spec]),
                           cowboy_req:reply(400, Req)
                   end,
    {ok, ResReq, State};

handle_req(<<"trace_status">>, Req, State) ->
    {_, Paused, _} = xprof_tracer:trace_status(),
    Json = jiffy:encode({[{tracing, not Paused}]}),
    {ok, ResReq} = cowboy_req:reply(200,
                                    [{<<"content-type">>,
                                      <<"application/json">>}],
                                    Json, Req),

    {ok, ResReq, State}.


%% Helpers

-spec get_mfa(cowboy:req()) -> {module(), atom(), non_neg_integer()}.
get_mfa(Req) ->
    {Params, _} = cowboy_req:qs_vals(Req),
    {list_to_atom(binary_to_list(proplists:get_value(<<"mod">>, Params))),
     list_to_atom(binary_to_list(proplists:get_value(<<"fun">>, Params))),
     binary_to_integer(proplists:get_value(<<"arity">>, Params))}.
