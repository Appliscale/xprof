%% @doc XProf visual profiler
-module(xprof).

%% match-spec
-type ms() :: [tuple()].
%% traced function with optional match-spec
%% used to initiate tracing (both by xprof_tracer and xprof_tracer_handler)
-type mfa_spec() :: {mfa_id(), {ms(), ms()}}.

%% used by gui and xprof_tracer to identify mfas
%% arity of '_' means all arities
%% similar to type erlang:trace_pattern_mfa()
-type mfa_id() :: {module(), atom(), arity() | '_'}.

%% derived from mfa_id
%% used to register ets tables and xprof_tracer_handler gen_servers
-type mfa_name() :: atom().

%% accepted syntax mode
-type mode() :: erlang | elixir.

-export_type([mfa_spec/0, mfa_id/0, mfa_name/0, mode/0]).
