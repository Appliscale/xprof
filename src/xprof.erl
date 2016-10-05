%% @doc XProf visual profiler
-module(xprof).

-export([start/0, stop/0]).

-include("xprof.hrl").

%% match-spec
-type ms() :: [tuple()].
%% traced function with optional match-spec
%% used to initiate tracing (both by xprof_tracer and xprof_tracer_handler)
-type mfaspec() :: mfa() | {module(), atom(), {ms(), ms()}}.

%% used by gui and xprof_tracer to identify mfas
%% arity of '*' means all arities
-type mfaid() :: {module(), atom(), arity() | '*'}.

%% derived from mfaid
%% used to register ets tables and xprof_tracer_handler gen_servers
-type mfaname() :: atom().

-export_type([mfaspec/0, mfaid/0, mfaname/0]).


start() ->
    application:ensure_all_started(?APP).

stop() ->
    application:stop(?APP).
