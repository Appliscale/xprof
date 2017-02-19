BIN_DIR:=node_modules/.bin

compile:
	./rebar3 compile

dev: compile webpack
	./rebar3 as dev shell

npm:
	cd priv; npm install

bower: npm
	cd priv; $(BIN_DIR)/bower install

bootstrap_front_end: bower

check_front_end:
	cd priv; $(BIN_DIR)/eslint *.json app/*.jsx app/*.js test/*.js test/*.jsx

test_front_end: check_front_end
	cd priv; $(BIN_DIR)/mocha test/.setup.js test/*.test.js test/*.test.jsx

webpack: test_front_end
	cd priv; $(BIN_DIR)/webpack -d

webpack_autoreload: bower
	cd priv;  $(BIN_DIR)/webpack -w -d

test: compile
	./rebar3 do eunit -c, ct -c, cover


.PHONY=compile dev npm bower bootstrap_front_end check_front_end test_front_end webpack webpack_autoreload test
