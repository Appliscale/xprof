-module(xprof_core_hist_SUITE).

-export([all/0]).
-export([groups/0]).
-export([suite/0]).
-export([init_per_suite/1]).
-export([end_per_suite/1]).
-export([group/1]).
-export([init_per_group/2]).
-export([end_per_group/2]).
-export([init_per_testcase/2]).
-export([end_per_testcase/2]).

-define(root,?config(data_dir,Config)).

-export([t_hdr_create/1]).
-export([t_hdr_total_count/1]).
-export([t_hdr_max_value/1]).
-export([t_hdr_min_value/1]).
-export([t_hdr_mean_value/1]).
-export([t_hdr_percentiles/1]).
-export([t_hdr_reset/1]).
-export([t_hdr_close/1]).
-export([t_issue_004/1]).
-export([t_issue_013/1]).
-export([t_use_after_close/1]).

-export([load_histograms/0]).

-include_lib("common_test/include/ct.hrl").

-define(BADARG(Expr), (fun() ->
                               case (catch Expr) of
                                   {'EXIT', {badarg, _}} -> ok;
                                   __Other__ -> ct:fail([{line, ?LINE},
                                                         {expected, badarg},
                                                         {actual, __Other__}])
                               end
                       end)()).

all() ->
    [
     {group, hdr}
    , {group, regression}
    ].

groups() ->
    [{hdr, [], [
        t_hdr_create
      , t_hdr_total_count
      , t_hdr_max_value
      , t_hdr_min_value
      , t_hdr_mean_value
      , t_hdr_percentiles
      , t_hdr_reset
      , t_hdr_close
    ]},
     %% Counter examples / regression tests for bugs
    {regression, [], [
        t_issue_004,
        t_issue_013,
        t_use_after_close
    ]}].

suite() ->
    [{ct_hooks, [cth_surefire]}, {timetrap, 2000}].

init_per_suite(Config) ->
    Config.

end_per_suite(Config) ->
    Config.

group(_GroupName) ->
    [].

init_per_group(_GroupName, Config) ->
    Raw = load_histograms(),
    [{raw,Raw}|Config].

end_per_group(_GroupName, Config) ->
    Config.

init_per_testcase(_TestCase, Config) ->
    Config.

end_per_testcase(_TestCase, Config) ->
    Config.

t_hdr_create(_Config) ->
    {ok,R} = xprof_core_hist:open(36000000, 4),
    xprof_core_hist:close(R),
    ok.

t_hdr_total_count(Config) ->
    Raw = ?config(raw,Config),
    10001 = xprof_core_hist:total_count(Raw),
    ok.

t_hdr_max_value(Config) ->
    Raw = ?config(raw,Config),
    RawMax = xprof_core_hist:max(Raw),
    xprof_core_hist:same(Raw,100000000,RawMax),
    ok.

t_hdr_min_value(Config) ->
    Raw = ?config(raw,Config),
    1000 = xprof_core_hist:min(Raw),
    ok.

t_hdr_mean_value(Config) ->
    Raw = ?config(raw,Config),
    11000.0 = xprof_core_hist:mean(Raw),
    ok.

t_hdr_percentiles(Config) ->
    Raw = ?config(raw,Config),
    cmp(1.0e3 , xprof_core_hist:percentile(Raw, 30.0), 0.001),
    cmp(1.0e3 , xprof_core_hist:percentile(Raw, 99.0), 0.001),
    cmp(1.0e3 , xprof_core_hist:percentile(Raw, 99.99), 0.001),
    cmp(1.0e8 , xprof_core_hist:percentile(Raw, 99.999), 0.001),
    cmp(1.0e8 , xprof_core_hist:percentile(Raw, 100.0), 0.001),
    ok.

t_hdr_reset(Config) ->
    Raw = ?config(raw,Config),
    xprof_core_hist:reset(Raw),
    0 = xprof_core_hist:total_count(Raw),
    %% FIXME why is this an integer???
    %%0.0 = xprof_core_hist:percentile(Raw, 99.0),
    0 = xprof_core_hist:percentile(Raw, 99.0),
    ok.

t_hdr_close(Config) ->
    Raw = ?config(raw,Config),
    xprof_core_hist:close(Raw),
    %% double close is harmless
    ok.

t_issue_004(_Config) ->
    {ok,R} = xprof_core_hist:open(10,1),
    [ begin
        ok = xprof_core_hist:record(R, X)
    end || X <- lists:seq(0,10) ],
    {error, value_out_of_range} = xprof_core_hist:record(R, -1),
    {error, value_out_of_range} = xprof_core_hist:record(R, 11),
    ok = xprof_core_hist:close(R).

t_issue_013(_Config) ->
    {ok,R} = xprof_core_hist:open(10,1),
    [ begin
      ok = xprof_core_hist:record_many(R, X, 10)
    end || X <- lists:seq(0,10) ],
    {error, value_out_of_range} = xprof_core_hist:record(R, -1),
    {error, value_out_of_range} = xprof_core_hist:record(R, 11),
    ok = xprof_core_hist:close(R).

t_use_after_close(_Config) ->
    {ok, Closed} = xprof_core_hist:open(10, 1),
    ok = xprof_core_hist:close(Closed),

    ?BADARG(xprof_core_hist:total_count(Closed)),

    ?BADARG(xprof_core_hist:record(Closed, 1)),
    ?BADARG(xprof_core_hist:record_many(Closed, 1, 5)),

    ?BADARG(xprof_core_hist:min(Closed)),
    ?BADARG(xprof_core_hist:max(Closed)),
    ?BADARG(xprof_core_hist:mean(Closed)),

    ?BADARG(xprof_core_hist:percentile(Closed, 50.0)),

    ?BADARG(xprof_core_hist:same(Closed, 5, 5)),

    ?BADARG(xprof_core_hist:reset(Closed)),
    ?BADARG(xprof_core_hist:close(Closed)),

    ok.

load_histograms() ->
    %% init_per_group is run in a separate process which terminates
    %% before the test cases are run
    %% so spawn a separate long-lived process that owns the ets tables
    InitGroupProc = self(),
    proc_lib:spawn(
      fun() ->
              Res = (catch xprof_core_hist:open(raw_table, 3600 * 1000 * 1000, 3)),
              InitGroupProc ! Res,
              receive _ -> stop end
      end),
    receive
        {ok, Raw} -> ok;
        Error -> error(Error),
                 Raw = error
    end,
    load(10000, Raw),
    ok = xprof_core_hist:record(Raw, 100000000),
    Raw.

load(0, Raw) ->
    Raw;
load(N, Raw) ->
    ok = xprof_core_hist:record(Raw, 1000),
    load(N-1, Raw).

cmp(L1,L2,D) ->
    case erlang:abs(L1-L2) < D of
	false -> throw({not_same, L1, L2, D,
                        element(2, erlang:process_info(
                                     self(), current_stacktrace))});
	true -> true
    end.
