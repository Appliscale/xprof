-module(xprof_core).

-export([get_matching_mfas_pp/1,

         monitor_pp/1,
         monitor/1,
         demonitor/1,
         get_all_monitored/0,
         get_data/2,

         trace/1,
         get_trace_status/0,

         capture/3,
         capture_stop/1,
         get_captured_data_pp/2,
         get_captured_data/2,

         set_mode/1,
         get_mode/0
        ]).

-type timestamp() :: non_neg_integer().
%% Unix timestamp.

%%
%% Autocomplete
%%

%% @doc Get loaded modules and functions (MFAs) that match the query string.
%% Used for autocomplete suggestions on the GUI.
-spec get_matching_mfas_pp(binary()) -> [MFA :: binary()].
get_matching_mfas_pp(Query) ->
    xprof_core_vm_info:get_available_funs(Query).

%%
%% Monitoring functions
%%

%% @doc Start monitoring based on the specified query string.
-spec monitor_pp(binary()) -> ok | {error, Reason :: term()}.
monitor_pp(Query) ->
    xprof_core_tracer:monitor(binary_to_list(Query)).

%% @doc Start monitoring the specified function (MFA).
-spec monitor(mfa()) -> ok | {error, Reason :: already_traced}.
monitor(MFA) ->
    xprof_core_tracer:monitor(MFA).

%% @doc Stop monitoring the specified function (MFA).
-spec demonitor(xprof:mfa_id()) -> ok.
demonitor(MFA) ->
    xprof_core_tracer:demonitor(MFA).

%% @doc Return list of monitored functions
%% (both as MFA and the original query string).
-spec get_all_monitored() -> [{xprof:mfa_id(), Query :: binary()}].
get_all_monitored() ->
    xprof_core_tracer:all_monitored().

%% @doc Return metrics gathered for the given function since the given
%% timestamp. Each item contains a timestamp and the corresponding histogram
%% metrics values.
-spec get_data(xprof:mfa_id(), timestamp()) -> [Item] | {error, not_found}
  when Item :: [{time, timestamp()} | {HistKey, number()}],
       HistKey :: min | mean | median | max | stddev
                | p25 | p50 | p75 | p90 | p99 | p9999999
                | memsize | count.
get_data(MFA, TimeStamp) ->
    xprof_core_trace_handler:data(MFA, TimeStamp).

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
-spec capture(xprof:mfa_id(), non_neg_integer(), non_neg_integer()) ->
                     {ok, CaptureId :: non_neg_integer()}.
capture(MFA, Threshold, Limit) ->
    xprof_core_trace_handler:capture(MFA, Threshold, Limit).

%% @doc Stop capturing long calls of the given function.
-spec capture_stop(xprof:mfa_id()) -> ok | {error, not_found}.
capture_stop(MFA) ->
    xprof_core_trace_handler:capture_stop(MFA).

%% @doc Return captured arguments and return values formatted according to the
%% active syntax mode.
%% @see get_captured_data/2
-spec get_captured_data_pp(xprof:mfa_id(), Offset :: non_neg_integer()) ->
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
-spec get_captured_data(xprof:mfa_id(), Offset :: non_neg_integer()) ->
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
%% Syntax mode
%%

%% @doc Set syntax mode explicitely.
-spec set_mode(xprof:mode()) -> ok.
set_mode(Mode) ->
    xprof_core_lib:set_mode(Mode).

%% @doc Get syntax mode, if not set explicitely it will be autodetected.
-spec get_mode() -> xprof:mode().
get_mode() ->
    xprof_core_lib:get_mode().
