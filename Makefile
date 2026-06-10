JS_PRIV=apps/xprof_gui/priv
BIN_DIR:=node_modules/.bin
REBAR3?=$(shell which rebar3 || echo ./rebar3)

ifdef XPROF_ERL_HIST
	MAYBE_UNLOCK_HIST = $(REBAR3) unlock hdr_histogram
endif

compile:
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) compile

dev: dev_front_end dev_back_end

dev_back_end:
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
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) as test do cover --reset, eunit -c, ct -c, cover --verbose

test_jiffy:
	$(MAYBE_UNLOCK_HIST)
	export XPROF_JSON_LIB=jiffy; \
	$(REBAR3) as test_jiffy do compile, dialyzer, cover --reset, ct -c, cover --verbose

test_jsx:
	$(MAYBE_UNLOCK_HIST)
	export XPROF_JSON_LIB=jsx; \
	$(REBAR3) as test_jsx do compile, dialyzer, cover --reset, ct -c, cover --verbose

test_thoas:
	$(MAYBE_UNLOCK_HIST)
	export XPROF_JSON_LIB=thoas; \
	$(REBAR3) as test_thoas do compile, dialyzer, cover --reset, ct -c, cover --verbose

send_coveralls:
	$(REBAR3) as test coveralls send

doc:
	$(REBAR3) edoc

./doc/src/readme.md: README.md
	sed -e 's|(doc/src/querysyntax.md)|(querysyntax.html)|' \
	    -e 's|doc/assets/|assets/|' \
	    -e '1 s|\[!\[.*||' README.md > ./doc/src/readme.md

gen_ex_doc: ./doc/src/readme.md
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) as docs ex_doc --app xprof_core
	$(REBAR3) as docs ex_doc --app xprof_gui
	cp _build/docs/lib/xprof_core/ebin/xprof_core.beam _build/docs/lib/xprof/ebin
	cp _build/docs/lib/xprof_gui/ebin/xprof_gui_rest.beam _build/docs/lib/xprof/ebin
	$(REBAR3) as docs ex_doc --app xprof

dialyzer:
	$(MAYBE_UNLOCK_HIST)
	$(REBAR3) dialyzer

publish:
	$(REBAR3) as publish hex publish --deps_from_config

publish_docs: gen_ex_doc
	$(REBAR3) as publish hex docs

.PHONY: compile dev dev_back_end dev_front_end npm bootstrap_front_end test_front_end build_prod_front_end test send_coveralls doc gen_ex_doc dialyzer publish publish_docs
