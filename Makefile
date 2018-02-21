JS_PRIV=apps/xprof_gui/priv
BIN_DIR:=node_modules/.bin

# this will update cowboy version based on rebar.config overwriting the lock file
ifdef COWBOY_VERSION
	MAYBE_UPDATE_COWBOY = ./rebar3 upgrade cowboy
endif

compile:
	$(MAYBE_UPDATE_COWBOY)
	./rebar3 compile

dev: webpack
	$(MAYBE_UPDATE_COWBOY)
	./rebar3 as dev compile, shell

npm:
	cd $(JS_PRIV); npm install

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
	$(MAYBE_UPDATE_COWBOY)
	./rebar3 do eunit -c, ct -c, cover

doc:
	./rebar3 edoc

dialyzer:
	$(MAYBE_UPDATE_COWBOY)
	./rebar3 dialyzer

publish:
	./rebar3 as publish hex publish --deps_from_config

.PHONY: compile dev npm bootstrap_front_end check_front_end test_front_end webpack webpack_autoreload test doc dialyzer
