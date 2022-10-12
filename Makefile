JS_PRIV=apps/xprof_gui/priv
BIN_DIR:=node_modules/.bin
VERSION:=$(shell grep vsn apps/xprof/src/xprof.app.src | cut -d '"' -f 2)
REBAR3?=$(shell which rebar3 || echo ./rebar3)

# this will update cowboy version based on rebar.config overwriting the lock file
ifdef COWBOY_VERSION
	MAYBE_UPDATE_COWBOY = $(REBAR3) upgrade cowboy
endif
ifdef XPROF_ERL_HIST
	MAYBE_UNLOCK_HIST = $(REBAR3) unlock hdr_histogram
endif

compile:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) compile

dev: dev_front_end dev_back_end

dev_back_end:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) as dev compile, shell

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
	$(REBAR3) as test do cover --reset, eunit -c, ct -c, cover --verbose

test_jiffy:
	$(MAYBE_UPDATE_COWBOY)
	$(MAYBE_UNLOCK_HIST)
	export XPROF_JSON_LIB=jiffy; \
	$(REBAR3) as test_jiffy do compile, dialyzer, cover --reset, ct -c, cover --verbose

doc:
	$(REBAR3) edoc

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
	$(REBAR3) dialyzer

publish:
	$(REBAR3) as publish hex publish --deps_from_config

.PHONY: compile dev dev_back_end dev_front_end npm bootstrap_front_end test_front_end build_prod_front_end test doc gen_ex_doc dialyzer publish
