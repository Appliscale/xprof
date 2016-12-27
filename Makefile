BIN_DIR:=node_modules/.bin

compile:
	./rebar3 compile

dev: compile webpack
	./rebar3 as dev shell

npm:
	cd priv; npm install

bower: npm
	cd priv; $(BIN_DIR)/bower install

check_front_end: bower
	cd priv; $(BIN_DIR)/eslint *.json app/*.jsx app/*.js test/*.js

test_front_end: check_front_end
	cd priv; $(BIN_DIR)/mocha test/.setup.js test/*.test.js

webpack: test_front_end
	cd priv; $(BIN_DIR)/webpack

webpack_autoreload: bower
	cd priv;  $(BIN_DIR)/webpack -w -d

test: compile
	./rebar3 do eunit -c, ct -c, cover


.PHONY=compile dev bower webpack webpack_autoreload test npm
