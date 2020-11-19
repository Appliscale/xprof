%%% @doc Server to store loaded record definitions.
-module(xprof_core_records).

-export([start_link/0,
         load_records/1,
         forget_records/0,
         forget_records/1,
         get_record_defs/0,
         record_print_fun/0
        ]).

%% gen_server callbacks

-export([init/1,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3]).

-define(TABLE, ?MODULE).

-record(state, {}).

%% @doc Start record store.
-spec start_link() -> {ok, pid()}.
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

%% @doc Load record definitions from module.
%% (similar to shell command `rr/1')
-spec load_records(module()) -> [RecName :: atom()].
load_records(Mod) when is_atom(Mod) ->
    gen_server:call(?MODULE, {load_records, Mod}).

%% @doc Remove all record definitions.
%% (similar to shell command ```rf('_')''')
-spec forget_records() -> ok.
forget_records() ->
    gen_server:call(?MODULE, forget_records).

%% @doc Remove selected record definitions. RecNames is a record name or a
%% list of record names. To remove all record definitions, use '_'.
%% (similar to shell command `rf/1')
-spec forget_records(atom() | [atom()]) -> ok.
forget_records('_') ->
    forget_records();
forget_records(RecName) when is_atom(RecName) ->
    forget_records([RecName]);
forget_records(RecNames) when is_list(RecNames) ->
    gen_server:call(?MODULE, {forget_records, RecNames}).

%% @doc Return all stored record definitions.
%% (Similar to shell command `rl()')
-spec get_record_defs() -> [tuple()].
get_record_defs() ->
    try
        ets:select(?TABLE, [{{'_', '$1'}, [], ['$1']}])
    catch
        error:badarg ->
            %% table does not exist for some reason
            []
    end.

%% @doc Return callback fun for `io_lib_pretty:print/2'
-spec record_print_fun() -> fun().
record_print_fun() ->
    fun record_print_fun/2.

%% gen_server callbacks

init([]) ->
    ets:new(?TABLE, [set, protected, named_table, {read_concurrency, true}]),
    Mods = application:get_env(xprof_core, load_records, []),
    case Mods of
        [] ->
            ok;
        _ ->
            RecNames = lists:flatmap(fun get_and_store_record_defs/1, Mods),
            error_logger:info_msg("~p: Loaded records: ~p", [?MODULE, RecNames])
    end,
    {ok, #state{}}.

handle_call({load_records, Mod}, _From, State) ->
    RecNames = get_and_store_record_defs(Mod),
    {reply, RecNames, State};
handle_call(forget_records, _From, State) ->
    ets:delete_all_objects(?TABLE),
    {reply, ok, State};
handle_call({forget_records, RecNames}, _From, State) ->
    [ets:delete(?TABLE, RecName) || RecName <- RecNames],
    {reply, ok, State};
handle_call(_Request, _From, State) ->
    {reply, ignored, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% Internal functions

get_and_store_record_defs(Mod) ->
    Entries = get_record_defs(Mod),
    ets:insert(?TABLE, Entries),
    [RecName || {RecName, _} <- Entries].

get_record_defs(Mod) ->
    case code:get_object_code(Mod) of
        {_Mod, Bin, _Filename} ->
            case beam_lib:chunks(Bin, [abstract_code]) of
                {ok, {_Mod, [{abstract_code, {raw_abstract_v1, Forms}}]}} ->
                    Defs =
                        [{RecName, {attribute, Anno, record, {RecName, remove_types(Fields)}}}
                         || {attribute, Anno, record, {RecName, Fields}} <- Forms],
                    Defs;
                _Error ->
                    []
            end;
        error ->
            []
    end.

remove_types([{typed_record_field, Field, _Type} | Fs]) ->
    [Field | remove_types(Fs)];
remove_types([Field | Fs]) ->
    [Field | remove_types(Fs)];
remove_types([]) ->
    [].

%% Taken from `shell:record_print_fun/1'
record_print_fun(RecName, NumFields) ->
    case ets:lookup(?TABLE, RecName) of
        [{_, {attribute, _Anno, record, {RecName, Fields}}}]
          when length(Fields) =:= NumFields ->
            record_fields(Fields);
        _ ->
            no
    end.

record_fields([{record_field,_,{atom,_,Field}} | Fs]) ->
    [Field | record_fields(Fs)];
record_fields([{record_field,_,{atom,_,Field},_} | Fs]) ->
    [Field | record_fields(Fs)];
record_fields([]) ->
    [].
