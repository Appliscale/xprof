-module(xprof_core_query).

-export([parse_query/1]).

parse_query(Query) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    ModeCb:parse_query(Query).
