-module(xprof_test_lib).

-export([run_elixir_unit_tests/1]).

-define(EUNIT_NOAUTO, true).
-include_lib("eunit/include/eunit.hrl").

run_elixir_unit_tests(Tests) ->
    case os:find_executable("elixir") of
        false ->
            %% no Elixir in path - skip elixir tests
            [];
        _ ->
            {setup,
             fun setup_elixir/0,
             fun cleanup_elixir/1,
             Tests}
    end.

setup_elixir() ->
    %% Ensure Elixir is in the code path
    ElixirEbin =
        case code:ensure_loaded(elixir) of
            {module, _} ->
                %% Elixir already loaded - happy days
                undefined;
            _ ->
                add_elixir_to_path()
        end,
    {ok, Apps} = application:ensure_all_started(elixir),
    {ElixirEbin, Apps}.

add_elixir_to_path() ->
    ElixirEbin =
        string:strip(
          ?cmd("elixir -e 'IO.puts :code.lib_dir(:elixir, :ebin)'"),
          right,
          $\n),
    true = code:add_patha(ElixirEbin),
    ElixirEbin.

cleanup_elixir({ElixirEbin, Apps}) ->
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
