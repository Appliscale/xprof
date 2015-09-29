compile:
	./rebar3 compile

dev: compile
	erl -pa _build/default/lib/*/ebin -s sync go -s xprof start

.PHONY=compile dev
