-module(xprof_gui_favourites).

-behaviour(gen_server).

-export([start_link/0]).

%% gen_server callbacks
-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-export([get_all/0, remove/1, add/1, reload/0]).

-record(state, {queries}).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

get_all() ->
    Queries = gen_server:call(?MODULE, get_all),
    get_xprof_queries(Queries).

remove(XprofQuery) when is_binary(XprofQuery)->
    remove(binary:bin_to_list(XprofQuery));
remove(XprofQuery) ->
    Queries = gen_server:call(?MODULE, {remove, XprofQuery}),
    get_xprof_queries(Queries).

add(XprofQuery) when is_binary(XprofQuery)->
    add(binary:bin_to_list(XprofQuery));
add(XprofQuery) ->
    Queries = gen_server:call(?MODULE, {add, XprofQuery}),
    get_xprof_queries(Queries).

reload() ->
    gen_server:call(?MODULE, reload).

init([]) ->
    {Status, Queries} = xprof_gui_favourites_config:load_queries(),
    {Status, #state{queries = lists:usort(Queries)}}.

handle_call(reload, _From, State) ->
    {Status, Queries} = xprof_gui_favourites_config:load_queries(),
    {reply, Status, State#state{queries = lists:usort(Queries)}};

handle_call({remove, XprofQuery}, _From, State = #state{queries = Queries}) ->
    UpdatedQueries = lists:filter(fun (Q) -> filter_query(Q, XprofQuery) end, Queries),
    xprof_gui_favourites_config:save_queries(UpdatedQueries),
    {reply, UpdatedQueries, State#state{queries = UpdatedQueries}};

handle_call({add, XprofQuery}, _From, State = #state{queries = Queries}) ->
    NewQuery = {query, [{xprof_query, XprofQuery}]},
    UpdatedQueries = lists:umerge([NewQuery], Queries),
    xprof_gui_favourites_config:save_queries(UpdatedQueries),
    {reply, UpdatedQueries, State#state{queries = UpdatedQueries}};

handle_call(get_all, _From, State = #state{queries = Queries}) ->
    {reply, Queries, State};
handle_call(Request, _From, State) ->
    lager:warning("Received unknown message: ~p", [Request]),
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

get_xprof_queries(Queries) ->
    XprofQueries = lists:map(fun xprof_query/1, Queries),
    lists:map(fun binary:list_to_bin/1, XprofQueries).

xprof_query({query, Config}) ->
    proplists:get_value(xprof_query, Config).

filter_query(Query, XprofQuery) ->
    case xprof_query(Query) of
        XprofQuery -> false;
        _ -> true
    end.