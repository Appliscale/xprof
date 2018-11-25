-module(xprof_core).

-export([%% Autocomplete
         expand_query/1,
         get_matching_mfas_pp/1,

         %% Monitoring functions
         monitor_pp/1,
         monitor_pp/2,
         monitor/1,
         monitor/2,
         demonitor/1,
         get_all_monitored/0,
         get_data/2,
         get_data_pp/2,
         get_called_funs/1,
         get_called_funs_pp/1,

         %% Global trace status
         trace/1,
         get_trace_status/0,

         %% Long call capturing
         capture/3,
         capture_stop/1,
         get_captured_data_pp/2,
         get_captured_data/2,

         %% Records

         rr/1,
         rf/0,
         rf/1,
         rl/0,

         %% Syntax mode
         set_mode/1,
         get_mode/0
        ]).

-export_type([cmd/0, param_name/0, params/0,
              mfa_spec/0, mfa_id/0, mfa_name/0,
              mode/0
             ]).

-type cmd() :: atom().
%% Command name.

-type param_name() :: atom().
%% Parameter name passed to commands.

-type params() :: [{param_name(), term()}].
%% Parameters passed to commands.

-type ms() :: [tuple()].
%% Match-specification.

-type mfa_spec() :: {mfa_id(), {ms(), ms()}}.
%% Traced function with optional match-spec.
%% Used to initiate tracing (both by `xprof_core_tracer' and
%% `xprof_core_trace_handler').

-type mfa_id() :: {module(), atom(), arity() | '_'}.
%% Used by the GUI and `xprof_core_tracer' to identify mfas.
%% Arity of `` '_' '' means all arities.
%% Similar to type `erlang:trace_pattern_mfa()'.

-type mfa_name() :: atom().
%% Derived from `mfa_id'.
%% Used to register ets tables and `xprof_core_trace_handler' gen_servers.

-type mode() :: erlang | elixir.
%% Accepted syntax mode.

-type timestamp() :: non_neg_integer().
%% Unix timestamp.

%%
%% Autocomplete
%%

%% @doc Get expansion suggestions for the given possibly incomplete query.
-spec expand_query(binary())
                  -> {CommonPrefix :: binary(), [Match]}
                         when Match :: {Prefix :: binary(), Label :: binary()}.
expand_query(Query) ->
    case xprof_core_cmd:expand_query(Query) of
        {error, Reason} ->
            {<<"">>, [{<<"">>, unicode:characters_to_binary(Reason)}]};
        {Prefix, Choices} ->
            {Prefix,
             [case Choice of
                  {Expand, Label, Hint} ->
                      {Expand, unicode:characters_to_binary([Label, " - ", Hint])};
                  {_Expand, _Label} ->
                      Choice
              end
              || Choice <- Choices]}
    end.

%% @doc Get loaded modules and functions (MFAs) that match the query string.
%% Used for autocomplete suggestions on the GUI.
-spec get_matching_mfas_pp(binary()) -> [MFA :: binary()].
get_matching_mfas_pp(Query) ->
    xprof_core_vm_info:get_available_funs(Query).

%%
%% Monitoring functions
%%

%% @doc Start monitoring based on the specified query string.
-spec monitor_pp(binary()) -> ok | {error, Reason :: already_traced | string()}.
monitor_pp(Query) ->
    monitor_pp(Query, []).

%% @doc Start monitoring based on the specified query string with additional
%% parameters. Additional parameters have precedence overthe same keys in the
%% query.
-spec monitor_pp(binary(), [{binary(), binary()}])
                -> ok | {error, Reason :: already_traced | string()}.
monitor_pp(Query, AdditionalParams) ->
    xprof_core_tracer:monitor_query(Query, AdditionalParams).

%% @doc Start monitoring the specified function (MFA).
-spec monitor(mfa()) -> ok | {error, Reason :: already_traced | string()}.
monitor(MFA) ->
    xprof_core_tracer:monitor(MFA).

%% @doc Start the specified command.
-spec monitor(cmd(), params()) -> ok | {error, Reason :: term()}.
monitor(Cmd, Params) ->
    xprof_core_tracer:monitor_cmd(Cmd, Params).

%% @doc Stop monitoring the specified function (MFA).
-spec demonitor(xprof_core:mfa_id()) -> ok.
demonitor(MFA) ->
    xprof_core_tracer:demonitor(MFA).

%% @doc Return list of monitored functions
%% (both as MFA and the original query string).
-spec get_all_monitored() -> [{xprof_core:mfa_id(), Query :: binary()}].
get_all_monitored() ->
    xprof_core_tracer:all_monitored().

%% @doc Return metrics gathered for the given function since the given
%% timestamp. Each item contains a timestamp and the corresponding histogram
%% metrics values.
-spec get_data(xprof_core:mfa_id(), timestamp()) -> [Item] | {error, not_found}
  when Item :: [{time, timestamp()} | {HistKey, number()}],
       HistKey :: min | mean | median | max | stddev
                | p25 | p50 | p75 | p90 | p99 | p9999999
                | memsize | count.
get_data(MFA, TimeStamp) ->
    xprof_core_trace_handler:data(MFA, TimeStamp).

get_data_pp(MFA, TimeStamp) ->
    case xprof_core_trace_handler:data(MFA, TimeStamp) of
        {error, _} = Error ->
            Error;
        Items ->
            ModeCB = xprof_core_lib:get_mode_cb(),
            [[case is_atom(Key) of
                  true ->
                      {Key, Value};
                  _ ->
                      {ModeCB:fmt_term(Key), Value}
              end
              || {Key, Value} <- Item]
             || Item <- Items]
    end.

%% @doc Return list of called functions for given mfa tuple.
-spec get_called_funs(xprof_core:mfa_id()) -> [xprof_core:mfa_id()].
get_called_funs(MFA) ->
    xprof_core_vm_info:get_called_funs(MFA).

%% @doc Return list of called functions formatted according to the
%% active syntax mode
-spec get_called_funs_pp(xprof_core:mfa_id()) -> [MFA :: binary()].
get_called_funs_pp(MFA) ->
    ModeCb = xprof_core_lib:get_mode_cb(),
    Calls = xprof_core:get_called_funs(MFA),
    [ModeCb:fmt_mfa(M, F, A) || {M, F, A} <- Calls].

%%
%% Global trace status
%%

%% @doc Turn on tracing for one or all processes. Additionally tracing can be
%% paused and resumed for the same process specification (one or all) that was
%% given earlier.
-spec trace(pid() | all | pause | resume) -> ok.
trace(PidOrSpec) ->
    xprof_core_tracer:trace(PidOrSpec).

%% @doc Return current tracing state.
%% (The `initialized' status is basically the same as `paused', additionally
%%  meaning that no tracing was started yet since xprof was started)
-spec get_trace_status() -> {pid() | all, Status :: initialized | running | paused | overflow}.
get_trace_status() ->
    xprof_core_tracer:trace_status().

%%
%% Long call capturing
%%

%% @doc Start capturing arguments and return values of function calls that
%% lasted longer than the specified time threshold in ms.
-spec capture(xprof_core:mfa_id(), non_neg_integer(), non_neg_integer()) ->
                     {ok, CaptureId :: non_neg_integer()} | {error, not_found}.
capture(MFA, Threshold, Limit) ->
    xprof_core_trace_handler:capture(MFA, Threshold, Limit).

%% @doc Stop capturing long calls of the given function.
-spec capture_stop(xprof_core:mfa_id()) -> ok | {error, not_found | not_captured}.
capture_stop(MFA) ->
    xprof_core_trace_handler:capture_stop(MFA).

%% @doc Return captured arguments and return values formatted according to the
%% active syntax mode.
%% @see get_captured_data/2
-spec get_captured_data_pp(xprof_core:mfa_id(), Offset :: non_neg_integer()) ->
                               {ok, CaptureSpec, Items} | {error, not_found}
  when CaptureSpec :: {CaptureId :: non_neg_integer(),
                       Threshold :: non_neg_integer(),
                       Limit :: non_neg_integer(),
                       HasMore :: boolean()
                      },
       Items :: [{proplists:proplist()}].
get_captured_data_pp(MFA, Offset) ->
    case xprof_core:get_captured_data(MFA, Offset) of
        {ok, CaptureSpec, Items} ->
            ModeCb = xprof_core_lib:get_mode_cb(),
            ItemsJson = [{args_res2proplist(Item, ModeCb)} || Item <- Items],
            {ok, CaptureSpec, ItemsJson};
        Error ->
            Error
    end.

args_res2proplist({Index, Pid, CallTime, Args, Res}, ModeCb) ->
    [{id, Index},
     {pid, ModeCb:fmt_term(Pid)},
     {call_time, CallTime},
     {args, ModeCb:fmt_term(Args)},
     {res, format_result(Res, ModeCb)}].

format_result({return_from, Term}, ModeCb) ->
    ModeCb:fmt_term(Term);
format_result({exception_from, {Class, Reason}}, ModeCb) ->
    ModeCb:fmt_exception(Class, Reason).

%% @doc Return captured arguments and return values.
%%
%% The `Offset' argument is the item index last seen by the caller, only items
%% newer than that will be returned. An offset of 0 will return all data.
%%
%% The returned `HasMore' indicates whether capturing is still ongoing or it has
%% been stopped either manually or by reaching the limit.
-spec get_captured_data(xprof_core:mfa_id(), Offset :: non_neg_integer()) ->
                               {ok, CaptureSpec, [Item]} | {error, not_found}
  when CaptureSpec :: {CaptureId :: non_neg_integer(),
                       Threshold :: non_neg_integer(),
                       Limit :: non_neg_integer(),
                       HasMore :: boolean()
                      },
       Item :: {Index :: non_neg_integer(),
                CallingProcess :: pid(),
                CallTimeMs :: non_neg_integer(),
                Args :: list(),
                Result :: term()}.
get_captured_data(MFA, Offset) ->
    xprof_core_trace_handler:get_captured_data(MFA, Offset).

%%
%% Records
%%

%% @doc Load record definitions from module.
%% (similar to shell command `rr/1')
-spec rr(module()) -> [RecName :: atom()].
rr(Mod) ->
    xprof_core_records:load_records(Mod).

%% @doc Remove all record definitions.
%% (similar to shell command ```rf('_')''')
-spec rf() -> ok.
rf() ->
    xprof_core_records:forget_records().

%% @doc Remove selected record definitions. RecNames is a record name or a
%% list of record names. To remove all record definitions, use '_'.
%% (similar to shell command `rf/1')
-spec rf(atom() | [atom()]) -> ok.
rf(RecNameOrNames) ->
    xprof_core_records:forget_records(RecNameOrNames).

%% @doc Return all stored record definitions.
%% (Similar to shell command `rl()')
-spec rl() -> [tuple()].
rl() ->
    xprof_core_records:get_record_defs().

%%
%% Syntax mode
%%

%% @doc Set syntax mode explicitely.
-spec set_mode(xprof_core:mode()) -> ok.
set_mode(Mode) ->
    xprof_core_lib:set_mode(Mode).

%% @doc Get syntax mode, if not set explicitely it will be autodetected.
-spec get_mode() -> xprof_core:mode().
get_mode() ->
    xprof_core_lib:get_mode().
