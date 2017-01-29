// eslint-env: mocha

import { expect } from "chai";

import Utils from "../app/utils.js";

describe("Formatting MFA should be compatible with 'Erlang' specificity", function() {
  describe("Simple cases:", function() {
    it("erlang:process_info/1", function() {
      expect(Utils.formatMFA([ "erlang", "process_info", 1 ])).to.be.equal("erlang:process_info/1");
      expect(Utils.formatMFA([ "erlang", "process_info", "1" ])).to.be.equal("erlang:process_info/1");
    });

    it("lists:seq/2", function() {
      expect(Utils.formatMFA([ "lists", "seq", "2" ])).to.be.equal("lists:seq/2");
    });

    it("maps:get/3", function() {
      expect(Utils.formatMFA([ "maps", "get", "3" ])).to.be.equal("maps:get/3");
    });

    it("custom_module:function/0", function() {
      expect(Utils.formatMFA([ "custom_module", "function", 0 ])).to.be.equal("custom_module:function/0");
    });
  });

  describe("Failed expectations regarding arguments:", function() {
    it("Empty MFA array is not acceptable.", function() {
      expect(() => Utils.formatMFA([]))
        .to.throw(Error, "Unexpected argument passed to the formatter (MFA length: 0).");
    });

    it("Array with 1 or 2 arguments is also not acceptable.", function() {
      expect(() => Utils.formatMFA([ 1 ]))
        .to.throw(Error, "Unexpected argument passed to the formatter (MFA length: 1).");

      expect(() => Utils.formatMFA([ 1, 2 ]))
        .to.throw(Error, "Unexpected argument passed to the formatter (MFA length: 2).");
    });

    it("Array with more than 3 arguments is not acceptable too.", function() {
      expect(() => Utils.formatMFA(Array.from(Array(10).keys())))
        .to.throw(Error, "Unexpected argument passed to the formatter (MFA length: 10).");
    });

    it("Module name has to be non-empty string.", function() {
      expect(() => Utils.formatMFA([ null, "fun", 0 ]))
        .to.throw(Error, "Module name is not a string.");

      expect(() => Utils.formatMFA([ "", "fun", 0 ]))
        .to.throw(Error, "Module name is an empty string.");
    });

    it("Function name has to be non-empty string.", function() {
      expect(() => Utils.formatMFA([ "mod", null, 0 ]))
        .to.throw(Error, "Function name is not a string.");

      expect(() => Utils.formatMFA([ "mod", "", 0 ]))
        .to.throw(Error, "Function name is an empty string.");
    });
  });

  describe("For 'Elixir' modules we should have special syntax:", function() {
    it("'Elixir.Enum':map/2", function() {
      expect(Utils.formatMFA([ "Elixir.Enum", "map", 2 ])).to.be.equal("'Elixir.Enum':map/2");
    });

    it("'Elixir.Process':'is_alive?'/1", function() {
      expect(Utils.formatMFA([ "Elixir.Process", "alive?", 1 ])).to.be.equal("'Elixir.Process':'alive?'/1");
    });
  });

  describe("Edge cases:", function() {
    it("a0@a:'Abc'/0", function() {
      expect(Utils.formatMFA([ "a0@a", "Abc", 0 ])).to.be.equal("a0@a:'Abc'/0");
    });

    it("'Erlang!':'is_fun!'/1", function() {
      expect(Utils.formatMFA([ "Erlang!", "is_fun!", 1 ])).to.be.equal("'Erlang!':'is_fun!'/1");
    });
  });
});

describe("Generating valid id tag for the charts", function() {
  describe("Simple Erlang modules", function() {
    it("erlang:process_info/1", function() {
      expect(Utils.chartId([ "erlang", "process_info", 1 ])).to.be.equal("chart_erlang-process_info-1");
    });

    it("custom_module:function/99", function() {
      expect(Utils.chartId([ "custom_module", "function", 99 ])).to.be.equal("chart_custom_module-function-99");
    });
  });

  describe("Match-spec function", function() {
    it("ets:lookup/*", function() {
      expect(Utils.chartId([ "ets", "lookup", "*" ])).to.be.equal("chart_ets-lookup--");
    });
  });

  describe("Elixir modules", function() {
    it("'Elixir.Enum':map/2", function() {
      expect(Utils.chartId([ "Elixir.Enum", "map", 2 ])).to.be.equal("chart_-Elixir-Enum--map-2");
    });

    it("'Elixir.Process':'is_alive?'/1", function() {
      expect(Utils.chartId([ "Elixir.Process", "alive?", 1 ])).to.be.equal("chart_-Elixir-Process---alive---1");
    });
  });

  describe("Weird characters", function() {
    it("a0@a:'Abc'/0", function() {
      expect(Utils.chartId([ "a0@a", "Abc", 0 ])).to.be.equal("chart_a0-a--Abc--0");
    });

    it("'Erlang $!':'is_fun!'/1", function() {
      expect(Utils.chartId([ "Erlang $!", "is_fun!", 1 ])).to.be.equal("chart_-Erlang------is_fun---1");
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
