-module(xprof_gui_json).

-export([encode/1]).

-ifndef(XPROF_JSON_LIB).
-define(XPROF_JSON_LIB, jsone).
-endif.

-ifndef(XPROF_JSON_ENC_FUN).
-define(XPROF_JSON_ENC_FUN, encode).
-endif.

-spec encode(term()) -> binary().
encode(Data) ->
    ?XPROF_JSON_LIB:?XPROF_JSON_ENC_FUN(Data).
