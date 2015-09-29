-module(xprof_mapper).

-exports([init/0,finalize/0]).

init() ->
    ets:new(?MODULE, [named_table, {read_concurrency, true}, public]).

finalize() ->
    ets:delete(?MODULE).


