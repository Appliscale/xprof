// eslint-env: mocha

import React from "react";
import ReactTestUtils from "react-addons-test-utils";
import { shallow } from "enzyme";
import { expect } from "chai";
import { CallsTracer, CallsTableRow } from "../app/call_tracer.jsx";

function mockItem() {
  return { call_time: 10, pid: "<0.1.0>", args: "[]", res: "result" };
}

describe("<CallsTableRow />", () => {
  let row = null;
  const EXPAND_COLLAPSE_TOGGLE = ".btn";
  const EXPANDED_ROW = "row-expanded";
  const COLLAPSED_ROW = "row-normal";
  const EXPAND_BTN_CLASS = ".glyphicon-chevron-right";
  const COLLAPSE_BTN_CLASS = ".glyphicon-chevron-down";

  beforeEach(() => {
    row = shallow(<CallsTableRow key="1" item={mockItem()}/>);
  });

  it("is a table row", function() {
    expect(row.name()).to.equal("tr");
  });

  it("is not exapanded and has expand button in the collapsed mode", () => {
    expect(row.prop("className")).to.equal(COLLAPSED_ROW);
    expect(row.find(EXPAND_BTN_CLASS).exists()).to.equal(true);
  });

  it("has call time column", () => {
    expect(row.contains(<td>{10} &micro;s</td>)).to.equal(true);
  });

  it("has pid column", () => {
    expect(row.contains(<td>{"<0.1.0>"}</td>)).to.equal(true);
  });

  it("has args column with codebox", () => {
    expect(row.contains("[]")).to.equal(true);
  });

  it("has result column with codebox", () => {
    expect(row.contains("result")).to.equal(true);
  });

  it("expands after clicking expand button", () => {
    let row2 = shallow(<CallsTableRow key="1" item={mockItem()}/>);
    row2.find(EXPAND_COLLAPSE_TOGGLE).simulate("click", { preventDefault() {} });

    expect(row2.find(COLLAPSE_BTN_CLASS).exists()).to.equal(true);
    expect(row2.prop("className")).to.equal(EXPANDED_ROW);
  });

  it("collapses after clicking button twice", () => {
    let row2 = shallow(<CallsTableRow key="1" item={mockItem()}/>);

    row2.find(EXPAND_COLLAPSE_TOGGLE).simulate("click", { preventDefault() {} });
    row2.find(EXPAND_COLLAPSE_TOGGLE).simulate("click", { preventDefault() {} });

    expect(row2.prop("className")).to.equal(COLLAPSED_ROW);
    expect(row2.find(EXPAND_BTN_CLASS).exists()).to.equal(true);
  });

});
