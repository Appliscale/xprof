# Commands

Below you can find a list of currently supported commands. (The
examples are broken into multiple lines for readability.)

## `funlatency`

Measure latency of function calls. (Same functionality as simple
triplet and match-spec fun queries.)

Parameters:

* `retmatch` (optional): Return-value matching. The duration of the
  function will only be measured and a call will only be captured if
  its return value matches the given expression. Value can be a
  pattern or an anonymous function.
  
In the below example the function is only captured if it returns some
error

```erlang
#funlatency retmatch = {error, _},
            mfa = client:req/2
```

```elixir
%funlatency retmatch: {:error, _},
            mfa: Client.req/2
```

The matcher value can also be an anonymous function receiving the
return value as input and returning a boolean, whether to capture the
given call or not. The bellow example will only capture a call if it
returns some unexpected result which is not an ok-tuple with a
non-empty list.

```erlang
#funlatency retmatch = fun({ok, [_|_]}) -> false;
                          (_)-> true end,
            mfa = client:req(Id, _) -> message(Id)
```

```elixir
%funlatency retmatch: fn({:ok, [_|_]}) -> false;
                      (_)-> true end,
            mfa: Client.req(id, _) -> message(id)
```

The anonymous function can also return a modified result, that will
be shown when you capture function calls. This can be useful if you
are only interested in a part of the result or a value derived from
the result. The below example will capture calls which return a list
but only captures the first element.

```erlang
#funlatency retmatch = fun([H|_]) -> {true, H} end,
            mfa = client:req/2
```

```elixir
%funlatency retmatch: fn([h|_]) -> {true, h} end,
            mfa: Client.req/2
```

Also note that if the anonymous function does not handle certain
results (ie. function clause error) it counts as a no match.

## `argdist`

Show distribution of argument values. The command will show a heatmap
where each row corresponds to a different value and the colour of each
cell corresponds to how often that given value was seen in the given
sample internval. You can control which argument(s) to be measured by
the `message/1` action function in the match-spec body. You can
actually put any expression derived from the arguments.
  
Parameters:

* `enum` (default: 10): How many different values should be
  collected. If there are more all new values will count towards an
  `other` row. (This serves as a protection for XProf not to run out
  of memory if there are too many different values)

For example we would like to see what values the `cmp_id` field of the
request map can take at runtime:

```erlang
#argdist enum = 5,
         mfa = client:req(Req) -> message(map_get(cmp_id, Req))
```

```elixir
%argdist enum: 5,
         mfa: Client.req(req) -> message(map_get(:cmp_id, req))
```
