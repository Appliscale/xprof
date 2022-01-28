# Query Syntax

## Simple queries

The simplest way to specify what XProf should trace is with a
module-function-arity triplet.

Erlang example

```erlang
ets:lookup/2
```

Elixir example

```elixir
Register.lookup/2
```

## XProf flavoured match-spec funs

In the function browser apart from a module-function-arity you can
also specify further filters in the form of a match-spec fun (similar
to recon or redbug). After the module and function name one can also
give a function definition instead of arity. This gives the user the
full power of match specifications and can be used both to selectively
measure duration of function calls that match complicated filters and
to capture only part of the arguments. The function has the same
limitations as [`dbg:fun2ms/1`](`:dbg.fun2ms/1`). (See [Match Specifications in
Erlang](http://erlang.org/doc/apps/erts/match_spec.html) and
[ms\_transform](http://erlang.org/doc/man/ms_transform.html)).

The part after the module and function name can have different forms. It can be
only an argument filter or match-spec head optionally with guards. Or it can
also have a match-spec body and even multiple clauses. In the majority of
practical cases however the body is not necessary.

If the body is present the function can be terminated in Erlang syntax by a
single dot (just like a function definition) or `end.` (like a fun object
definition) but both can be omitted. In Elixir syntax no `end` keyword should be
placed at the end of the expression (unlike when defining a function or fun
object).

The `return_trace`/`exception_trace` switches are always implicitly on (as that
is how `xprof` measures duration)

Let's see some examples to make sense of all this.

### Erlang examples

Only measure the duration of `ets:lookup` on table `data`

```erlang
ets:lookup(data, _)
```

Measure connecting to either TCP port 80 or 443

```erlang
gen_tcp:connect(_, Port, _, _) when Port =:= 80; Port =:= 443
```

Only capture the important field of a possibly big tuple

```erlang
ets:insert(_, Data) -> message(element(3, Data)).
```

And just for the sake of example connecting to either port expressed with
multiple clauses. (As the match-spec body is only evaluated for its side-efects
or action-function calls and the actual return value is ignored to achieve the
default behaviour any dummy term can be put there like `ok` or `true`)

```erlang
gen_tcp:connect(_, 80, _, _) -> true; (_, 443, _, _) -> true end.
```

### Elixir examples

Measure duration of `Registry` lookups on `MyApp.Registry`

```elixir
Registry.lookup(MyApp.Registry, _)
```

Measure duration of dispatching to `"topic1"` or `"topic2"`

```elixir
Registry.dispatch(MyApp.Registry, topic, _) when topic in ["topic1", "topic2"]
```

Instead of a possibly long list only capture the length of the list

```elixir
Enum.fetch(list, index) when is_list(list) -> message([length(list), index])
```

Again just for the example dispatching to multiple topics expressed with
multiple clauses. (Notice there is no closing `end` keyword)

```elixir
Registry.dispatch(MyApp.Registry, "topic1", _) -> nil; (MyApp.Registry, "topic2", _) -> nil
```

## Commands

The most flexible and expressive query variant is a command name
followed by a key-value list of parameters. (This format must start
with a special character, `%` in Erlang and `#` in Elixir.) The
special `mfa` parameters must be the last one and its value can be a
simple query or an XProf-flavoured match-spec fun.

The Erlang syntax is similar to a record,

```erlang
#cmd param1 = {"val", 1}, mfa = mod:fun(_)
```

while the Elixir syntax is similar to a struct, both without the curly brackets.

```elixir
%Cmd param1: {'val', 1}, mfa: Mod.fun(_)
```

See description and examples on the Commands page.
