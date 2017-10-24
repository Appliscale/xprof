XProf [![Build Status](https://travis-ci.org/Appliscale/xprof.svg?branch=master)](https://travis-ci.org/Appliscale/xprof) [![Coverage Status](https://coveralls.io/repos/github/Appliscale/xprof/badge.svg?branch=master)](https://coveralls.io/github/Appliscale/xprof?branch=master) [![Hex.pm](https://img.shields.io/hexpm/v/xprof.svg?style=flat-square)](https://hex.pm/packages/xprof) [![Hex.pm](https://img.shields.io/hexpm/dt/xprof.svg?style=flat-square)](https://hex.pm/packages/xprof) [![Gitter](https://badges.gitter.im/Appliscale/xprof.svg)](https://gitter.im/Appliscale/xprof?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
=====

*XProf* is a profiler that allows you to track execution time of Elixir / Erlang
functions. It's also able to capture arguments and results (return value or
exception) of function calls that lasted longer than given number of
milliseconds.

## Goal

*XProf* was created to help solving performance problems of live, highly
concurrent and utilized BE systems. It's often the case that high latency or big
CPU usage is caused by very specific requests that are triggering
inefficient code. Finding this code is usually pretty difficult.

## How does it look like

Click the image below to watch a short demo investigating the `TryMe`
application with XProf. The function `nap` sometimes takes way too much time (as
you would guess from the name, it takes a bit of sleep). In the video we:
- observe call count and duration percentiles
- capture arguments and return values of a few long calls
- apply a match spec to filter out "long" calls
- compare two functions

[![XProf Demo](xprof_demo_1.2.1_screenshot.png)](https://youtu.be/CRPC6zloDS0 "XProf Demo")

## How to use it

1. Add `xprof` to your build tool config file (and optionally also to the
   release config file such as `reltool.config` in order to include it in your
   release).
2. Build your project.
3. Start `xprof` by executing `xprof:start().` in Erlang shell,
   or `:xprof.start` in Elixir shell.
4. Go to http://localhost:7890 (replace localhost with your server’s hostname if you connect to a remote host).
5. Type in function that you would like to start tracing.
6. Start tracing clicking green button.

The preferred way is to add the `xprof` *Hex* package as a dependency to you rebar3 config or Mix project file:

```erlang
%% rebar.config (at least version `3.3.3` is required):

{deps, [
       ...
       {xprof, "1.3.0"}
]}.
```

```elixir
# `mix.exs`:

defp deps do
    [
      ...
      {:xprof, "~> 1.3.0"}
    ]
  end
```

You can also fetch from the github repository:

```erlang
{deps, [
       ...
       {xprof, {git, "https://github.com/appliscale/xprof.git", {tag, "1.3.0"}}}
]}.
```

## Keyboard shortcuts

- **UP**/**DOWN** arrows: select previous/next item in the dropdown suggestion
  list
- **TAB**: if no suggetion is selected yet auto-complete to longest common
  prefix of dropdown list items. Otherwise copy the selected item to the search
  box and refresh the dropdown list.
- **ENTER**: start tracing either the selected suggestion if there is any or the
  expression in the search box.

## Syntax mode

XProf supports both Erlang and Elixir syntax. If the `elixir` application is
running it will use Elixir syntax and Erlang syntax otherwise to read the
function to trace and to print captured arguments. It is also possible to
manually set the preferred mode.

## Recursive functions

By default XProf only measures the outermost call to a recursive function. For
example `lists:map(fun f/1, [1, 2, 3]).` will only register one call to
`lists:map/2`. This is also true for indirectly recursive functions (such as
when `a` calls `b` and `b` calls `a` again). This behaviour can be undesireable
so it can be disabled by setting the `ignore_recursion` environment variable to
false.

## Configuration

You can configure `xprof` by changing its application variables:

Key                    | Default        | Description
:----------------------|:---------------|:-----------
`port`                 | 7890           | Port for the web interface
`max_tracer_queue_len` | 1000           | Overflow protection. If main tracer proccess will have more than 1000 messages in its process queue tracing will be stopped and one needs to use trace button to resume. The purpose of this is to prevent out of memory crashes when tracer process is not able to process incomming traces fast enough. This may happen when we trace very "hot" function.
`max_duration`         | 30000          | The largest duration value in ms. In case a call takes even longer, this maximum value is stored instead.
`ignore_recursion`     | true           | Whether to only measure the outermost call to a recursive function or not (ie. measure all calls).
`mode`                 | <autodetected> | Syntax mode (`erlang` or `elixir`)

## XProf flavoured match-spec funs

In the function browser you can also specify further filters in the form of a
match-spec fun (similar to recon or redbug). After the module and function name
one can also give a function definition instead of arity. This gives the user
the full power of match specifications and can be used both to selectively
measure duration of function calls that match complicated filters and to capture
only part of the arguments. The function has the same limitations as
`dbg:fun2ms/1`. (See
[Match Specifications in Erlang](http://erlang.org/doc/apps/erts/match_spec.html) and
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

## Contributing

All improvements, fixes and ideas are very welcomed!

Project uses rebar3 for building and testing erlang code. WebUI part resides in
`xprof` app's priv directory and it's already precompiled so there is no need to
build JS sources in order to run `xprof`.

### Running tests

```bash
make test
```

### Working with JS sources

The WebUI uses

* *React.js*
* *ECMAScript 6* (with elements from *7th* version).
* *Bootstrap*
* *Webpack*

All sources are in _priv_ directory. The _app_ folder contains the sources and
the _build_ folder is a placeholder for final JS generated by webpack and then
served by cowboy server (*XProf's* dependency).

### Starting XProf in development mode

To develop `xprof` in a convenient way the following setup is recommended.

You have to invoke following command once, if you do not have dependencies or
you need to update them:

```bash
$ make bootstrap_front_end
```

Then going with normal development flow - in the first terminal window start
Erlang `xprof` by calling `make dev`. The _sync_ app will be started, It
automatically reloads erlang modules that have changed, so you don't need to
recompile every time something changed.

```bash
$ make dev
```

In the second window install all the assets and start *webpack* in development
mode which is also going to recompile all *JS* files in `priv` directory when
they are modified. To achieve that use following command:

```bash
$ make webpack_autoreload
```
