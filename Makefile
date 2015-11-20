compile:
	./rebar3 compile

dev: compile bower webpack
	./rebar3 shell

bower:
	cd priv; bower install

webpack:
	cd priv; webpack

test: compile
	./rebar3 ct -c

.PHONY=compile dev bower webpack test
