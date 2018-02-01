-module(xprof_core_cmd).

-export([expand_query/1]).

%% @doc Get expansion suggestions for the given possibly incomplete query.
-spec expand_query(binary()) -> {CommonPrefix :: binary(), [Match]}
                              | {error, Reason ::binary()}
                                    when
      Match :: {Prefix :: binary(), Label :: binary(), Hint :: binary()}
             | {Prefix :: binary(), Label :: binary()}.
expand_query(Query) ->
    try
        Result = expand_match_spec(Query),
        maybe_add_common_prefix(Result)
    catch throw:{error, _} = Error ->
            Error
    end.

expand_match_spec(Query) ->
    Funs = xprof_core_vm_info:get_available_funs(Query),
    _FilteredFuns = [{prefix_tail(Query, Fun), Fun} || Fun <- Funs].

prefix_tail(Prefix, Bin) ->
    case xprof_core_lib:prefix_rest(Prefix, Bin) of
        false ->
            <<>>;
        Res ->
            Res
    end.

maybe_add_common_prefix(Matches) when is_list(Matches) ->
    CommonPrefix = common_match_prefix(Matches),
    {CommonPrefix, Matches}.

common_match_prefix(Matches) ->
    common_prefix([element(1, Match) || Match <- Matches]).

common_prefix([]) ->
    <<>>;
common_prefix([Item]) ->
    Item;
common_prefix([_,_|_] = List) ->
    SortedList = lists:sort(List),
    First = hd(SortedList),
    Last = lists:last(SortedList),
    Len = common_prefix_len(First, Last, 0),
    binary:part(First, 0, Len).

common_prefix_len(<<C, A/binary>>, <<C, B/binary>>, N) ->
    common_prefix_len(A, B, N+1);
common_prefix_len(_, _, N) ->
    N.
