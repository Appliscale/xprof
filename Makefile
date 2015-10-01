compile:
	./rebar3 compile

dev: compile bower webpack
	erl -pa _build/default/lib/*/ebin -s xprof start

bower:
	cd priv; bower install

webpack:
	cd priv; webpack

.PHONY=compile dev bower webpack
