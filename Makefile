BIN_DIR:=node_modules/.bin

compile:
	./rebar3 compile

dev: compile webpack
	./rebar3 as dev shell

bower: npm
	cd priv; $(BIN_DIR)/bower install

webpack: bower
	cd priv; $(BIN_DIR)/webpack

webpack_autoreload: bower
	cd priv;  $(BIN_DIR)/webpack -w -d

npm:
	cd priv; npm install

test: compile
	./rebar3 do eunit -c, ct -c, cover


.PHONY=compile dev bower webpack webpack_autoreload test npm
