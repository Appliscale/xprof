-module(xprof_test_lib).

-export([run_elixir_unit_tests/1]).

-define(EUNIT_NOAUTO, true).
-include_lib("eunit/include/eunit.hrl").

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
    application:unset_env(xprof, mode),
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
    application:unset_env(xprof, mode),
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
