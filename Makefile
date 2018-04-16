JS_PRIV=apps/xprof_gui/priv
BIN_DIR:=node_modules/.bin

compile:
	./rebar3 compile

dev: dev_front_end dev_back_end

dev_back_end: 
	./rebar3 as dev compile, shell

dev_front_end:
	cd $(JS_PRIV); npm run start:with-cowboy &

npm:
	cd $(JS_PRIV); npm install

bootstrap_front_end: npm

test_front_end:
	cd $(JS_PRIV); npm run test:single-run

build_prod_front_end:
	cd $(JS_PRIV); npm run build

test: compile
	./rebar3 do eunit -c, ct -c, cover

doc:
	./rebar3 edoc

dialyzer:
	./rebar3 dialyzer

publish:
	./rebar3 as publish hex publish --deps_from_config

.PHONY: compile dev dev_back_end dev_front_end npm bootstrap_front_end test_front_end build_prod_front_end test doc dialyzer publish
