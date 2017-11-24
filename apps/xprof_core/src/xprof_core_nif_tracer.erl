-module(xprof_core_nif_tracer).

-export([enabled/3, trace_call/5, trace/5, load/0]).

-on_load(load/0).

load() ->
  erlang:load_nif("apps/xprof_nif/xprof_core_nif_tracer", []).

enabled(_, _, _) ->
  error.

trace_call(_, _, _, _, _) ->
  error.

trace(_, _, _, _, _) ->
  error.
