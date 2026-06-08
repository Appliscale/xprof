-module(xprof_core_test_lib).

-export([is_elixir_version/1,
         is_elixir_available/0,
         run_elixir_unit_tests/1,
         ensure_elixir_setup_for_e2e_test/0,
         wait_traces_processed/1]).

-define(EUNIT_NOAUTO, true).
-include_lib("eunit/include/eunit.hrl").

-spec is_elixir_version(string()) -> boolean().
is_elixir_version(Requirement) ->
    try
        ElixirVsn = 'Elixir.System':version(),
        'Elixir.Version':'match?'(ElixirVsn, list_to_binary(Requirement))
    catch _:_ ->
            false
    end.

-spec is_elixir_available() -> boolean().
is_elixir_available() ->
    try
        'Elixir.System':version(),
        true
    catch _:_ ->
        false
    end.

run_elixir_unit_tests(Tests) ->
    case os:find_executable("elixir") of
        false ->
            %% no Elixir in path - skip elixir tests
            [];
        Elixir ->
            case get_elixir_ebin(Elixir) of
                error ->
                    [];
                ElixirEbin ->
                    {setup,
                     fun() -> setup_elixir(ElixirEbin) end,
                     fun cleanup_elixir/1,
                     Tests}
            end
    end.

ensure_elixir_setup_for_e2e_test() ->
    case os:find_executable("elixir") of
        false ->
            %% no Elixir in path - skip elixir tests
            [];
        Elixir ->
            case get_elixir_ebin(Elixir) of
                error ->
                    [];
                ElixirEbin ->
                    {setup,
                     fun() -> setup_elixir(ElixirEbin) end,
                     fun() -> del_elixir_from_path(ElixirEbin) end}
            end
    end.

setup_elixir(ElixirEbin) ->
    %% Ensure Elixir is in the code path
    ElixirEbin1 =
        case lists:member(ElixirEbin, code:get_path()) of
            true ->
                %% Elixir already in path - happy days
                undefined;
            _ ->
                true = code:add_patha(ElixirEbin),
                ElixirEbin
        end,
    application:unset_env(xprof_core, mode),
    {ok, Apps} = application:ensure_all_started(elixir),
    {ElixirEbin1, Apps}.

get_elixir_ebin(Elixir) ->
    Cmd = Elixir ++ " -e 'IO.puts :code.lib_dir(:elixir, :ebin)'",
    case eunit_lib:command(Cmd) of
        {0, Output} ->
            _ElixirEbin = string:strip(Output, right, $\n);
        {Status, Output} ->
            io:format(user,
                      "~nfound elixir unusable - skipping elixir tests:~n"
                      "CMD: ~p => ~p~n~s~n", [Cmd, Status, Output]),
            error
    end.

cleanup_elixir({ElixirEbin, Apps}) ->
    application:unset_env(xprof_core, mode),
    [ok = application:stop(App) || App <- Apps],
    del_elixir_from_path(ElixirEbin),
    ok.

del_elixir_from_path(undefined) ->
    ok;
del_elixir_from_path(ElixirEbin) ->
    case code:del_path(ElixirEbin) of
        true -> ok;
        false -> ok;
        Error -> throw(Error)
    end.

%% Trace data is collected asynchronously through a two-hop pipeline:
%%
%%   traced process --[erlang:trace]--> xprof_core_tracer --[erlang:send]-->
%%       per-MFA handler (registered under xprof_core_lib:mfa2atom/1) --> ETS
%%
%% A test that reads this data right after making the traced calls can race
%% the delivery and processing of those messages (the source of intermittent
%% "expected N, got 0" failures). This makes such reads deterministic without
%% sleeping, by draining each hop of the pipeline in turn:
%%
%%   1. erlang:trace_delivered/1 returns once all trace messages generated
%%      before the call have reached the *tracer's* mailbox.
%%   2. sys:get_state/1 on the tracer forces it to process those messages
%%      (its mailbox is FIFO) and forward them with erlang:send/2, which is
%%      synchronous into the local handler's mailbox.
%%   3. sys:get_state/1 on the handler then forces it to process them, so the
%%      recorded data is in ETS and queryable.
-spec wait_traces_processed(mfa()) -> ok.
wait_traces_processed(MFA) ->
    Ref = erlang:trace_delivered(all),
    receive
        {trace_delivered, all, Ref} -> ok
    after 5000 ->
            error(trace_delivered_timeout)
    end,
    _ = sys:get_state(xprof_core_tracer),
    _ = sys:get_state(xprof_core_lib:mfa2atom(MFA)),
    ok.
