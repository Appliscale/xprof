// eslint-env: mocha

import { expect } from "chai";

import Utils from "../app/utils.js";

describe("Generating valid id tag for the charts", function() {
  describe("Simple Erlang modules", function() {
    it("erlang:process_info/1", function() {
      expect(Utils.chartId([ "erlang", "process_info", 1, "erlang:process_info/1" ])).to.be.equal("chart_erlang-process_info-1");
    });

    it("custom_module:function/99", function() {
      expect(Utils.chartId([ "custom_module", "function", 99, "custom_module:function/99" ])).to.be.equal("chart_custom_module-function-99");
    });
  });

  describe("Match-spec function", function() {
    it("ets:lookup/*", function() {
      expect(Utils.chartId([ "ets", "lookup", "*", "ets:lookup(mytab, _)" ])).to.be.equal("chart_ets-lookup-mytab--_-");
    });
  });

  describe("Elixir modules", function() {
    it("'Elixir.Enum':map/2", function() {
      expect(Utils.chartId([ "Elixir.Enum", "map", 2, "'Elixir.Enum':map/2" ])).to.be.equal("chart_-Elixir-Enum--map-2");
    });

    it("'Elixir.Process':'is_alive?'/1", function() {
      expect(Utils.chartId([ "Elixir.Process", "alive?", 1, "'Elixir.Process':'alive?'/1" ])).to.be.equal("chart_-Elixir-Process---alive---1");
    });
  });

  describe("Weird characters", function() {
    it("a0@a:'Abc'/0", function() {
      expect(Utils.chartId([ "a0@a", "Abc", 0, "a0@a:'Abc'/0" ])).to.be.equal("chart_a0-a--Abc--0");
    });

    it("'Erlang $!':'is_fun!'/1", function() {
      expect(Utils.chartId([ "Erlang $!", "is_fun!", 1, "'Erlang $!':'is_fun!'/1" ])).to.be.equal("chart_-Erlang------is_fun---1");
    });
  });
});

describe("Find common prefix", function() {
  it("No common prefix", function() {
    expect(Utils.commonArrayPrefix([ "aaa", "bbb", "ccc" ])).to.be.equal("");
  });

  it("Partial common prefix", function() {
    expect(Utils.commonArrayPrefix([ "abc", "abde", "abf" ])).to.be.equal("ab");
  });

  it("Full match", function() {
    expect(Utils.commonArrayPrefix([ "aaa", "aaa", "aaa" ])).to.be.equal("aaa");
  });

  it("Only single element", function() {
    expect(Utils.commonArrayPrefix([ "aaa" ])).to.be.equal("aaa");
  });
});

describe("Provide language dependent guides based on mode", function() {
  it("No mode provided", function() {
    expect(Utils.getLanguageGuides(null).language).to.be.equal(null);
  });

  it("Elixir mode", function() {
    expect(Utils.getLanguageGuides("elixir").language).to.be.equal("Elixir");
  });

  it("Erlang mode", function() {
    expect(Utils.getLanguageGuides("erlang").language).to.be.equal("Erlang");
  });

  it("For unknown we assume Erlang too", function() {
    expect(Utils.getLanguageGuides("foobar").language).to.be.equal("Erlang");
  });
});