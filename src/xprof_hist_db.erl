%% @doc Controls ETS table responsible for storing histogram references.
-module(xprof_hist_db).

-include("xprof.hrl").

-export([init/0, finalize/0]).
-export([get/1, put/2, exists/1, erase/1]).
-export_type([ref/0]).

-opaque(ref() :: binary()).  %% hdr_histogram doesn't export that type


-spec init() -> ok.
init() ->
    ets:new(?HIST_DB_ETS, [named_table, {read_concurrency, true}, public]),
    ok.

-spec finalize() -> ok.
finalize() ->
    ets:delete(?HIST_DB_ETS),
    ok.

-spec exists(mfa()) -> boolean().
exists(Key) ->
    ets:member(?HIST_DB_ETS, Key).

-spec get(mfa()) -> ref().
get(Key) ->
    case ets:lookup(?HIST_DB_ETS, Key) of
        [{_,HistRef}] -> HistRef;
        _ -> no_hist
    end.

-spec erase(mfa()) -> true.
erase(Key) ->
    ets:delete(?HIST_DB_ETS, Key).

-spec put(mfa(), ref()) -> true.
put(Key, Ref) ->
    ets:insert(?HIST_DB_ETS, {Key, Ref}).
