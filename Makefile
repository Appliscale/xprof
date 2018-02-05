JS_PRIV=apps/xprof_gui/priv
JS_NEW_PRIV=apps/xprof_gui/new-priv
BIN_DIR:=node_modules/.bin

compile:
	./rebar3 compile

dev: webpack
	./rebar3 as dev compile, shell

npm:
	cd $(JS_PRIV); npm install
	cd $(JS_NEW_PRIV); npm install

dev_new_front:
	cd $(JS_NEW_PRIV); npm start

serve_new_front:
	cd $(JS_NEW_PRIV); npm run build; npm install -g serve; serve -s build

bootstrap_front_end: npm

check_front_end:
	cd $(JS_PRIV); $(BIN_DIR)/eslint *.json app/*.jsx app/*.js test/*.js test/*.jsx

test_front_end: check_front_end
	cd $(JS_PRIV); $(BIN_DIR)/mocha test/.setup.js test/*.test.js test/*.test.jsx

webpack: test_front_end
	cd $(JS_PRIV); $(BIN_DIR)/webpack -d

webpack_autoreload: npm
	cd $(JS_PRIV); $(BIN_DIR)/webpack -w -d

test: compile
	./rebar3 do eunit -c, ct -c, cover

doc:
	./rebar3 edoc

dialyzer:
	./rebar3 dialyzer

publish:
	./rebar3 as publish hex publish --deps_from_config

.PHONY: compile dev npm bootstrap_front_end check_front_end test_front_end webpack webpack_autoreload test doc dialyzer dev_new_front serve_new_front
