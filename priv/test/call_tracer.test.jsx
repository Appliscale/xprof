// eslint-env: mocha

import React from "react";
import ReactTestUtils from "react-addons-test-utils";
import { shallow } from "enzyme";
import { expect } from "chai";

import { CallsTracer, CallsTableRow } from "../app/call_tracer.jsx";


function mockItem() {
  return { call_time: 10, pid: "<0.1.0>", args: "[]", res: "result" };
}

// TODO before each
describe("<CallsTableRow />", () => {
  let el = null;
  beforeEach(() => {
    el = shallow(<CallsTableRow key="1" item={mockItem()}/>);
  });

  it("is a table row", function() {
    expect(el.name()).to.equal("tr");
  });

  it("is not exapanded and has expand button in the collapsed mode", () => {
    expect(el.prop("className")).to.equal("row-normal");
    expect(el.find(".glyphicon-chevron-right").exists()).to.equal(true);
  });

  it("has call time column", () => {
    expect(el.contains(<td>{10} &micro;s</td>)).to.equal(true);
  });

  it("has pid column", () => {
    expect(el.contains(<td>{"<0.1.0>"}</td>)).to.equal(true);
  });

  it("has args column with codebox", () => {
    expect(el.contains("[]")).to.equal(true);
  });

  it("has result column with codebox", () => {
    expect(el.contains("result")).to.equal(true);
  });

  it("expands after clicking expand button", () => {
    let el2 = shallow(<CallsTableRow key="1" item={mockItem()}/>);
    el2.find(".btn").simulate("click", { preventDefault() {} });

    expect(el2.find(".glyphicon-chevron-down").exists()).to.equal(true);
    expect(el2.prop("className")).to.equal("row-expanded");
  });

  it("collapses after clicking button twice", () => {
    let el2 = shallow(<CallsTableRow key="1" item={mockItem()}/>);

    el2.find(".btn").simulate("click", { preventDefault() {} });
    el2.find(".btn").simulate("click", { preventDefault() {} });

    expect(el2.find(".glyphicon-chevron-right").exists()).to.equal(true);
    expect(el2.prop("className")).to.equal("row-normal");
  });

});
