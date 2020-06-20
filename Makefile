JS_PRIV=apps/xprof_gui/priv
BIN_DIR:=node_modules/.bin
VERSION:=$(shell grep vsn apps/xprof/src/xprof.app.src | cut -d '"' -f 2)

# this will update cowboy version based on rebar.config overwriting the lock file
ifdef COWBOY_VERSION
	MAYBE_UPDATE_COWBOY = ./rebar3 upgrade cowboy
endif
ifdef XPROF_ERL_HIST
	MAYBE_UNLOCK_HIST = ./rebar3 unlock hdr_histogram
endif

compile:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	./rebar3 compile

dev: dev_front_end dev_back_end

dev_back_end:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
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
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	./rebar3 do eunit -c, ct -c, cover

doc:
	./rebar3 edoc

~/.mix/escripts/ex_doc:
	mix escript.install hex ex_doc --force

./doc/src/readme.md: README.md
	sed -e 's|(doc/src/querysyntax.md)|(querysyntax.html)|' \
	    -e 's|doc/assets/|assets/|' \
	    -e '1 s|\[!\[.*||' README.md > ./doc/src/readme.md

gen_ex_doc: ~/.mix/escripts/ex_doc ./doc/docs.exs ./doc/src/readme.md ./doc/src/querysyntax.md
	~/.mix/escripts/ex_doc XProf $(VERSION) "doc/ebin" -c ./doc/docs.exs

dialyzer:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	./rebar3 dialyzer

publish:
	./rebar3 as publish hex publish --deps_from_config

.PHONY: compile dev dev_back_end dev_front_end npm bootstrap_front_end test_front_end build_prod_front_end test doc gen_ex_doc dialyzer publish
