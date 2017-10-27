// eslint-env: mocha

import _ from "underscore";
import React from "react";
import ReactTestUtils from "react-addons-test-utils";
import { mount, shallow } from "enzyme";
import { expect } from "chai";
import { CallsTracer, CallsTable, CallsTableRow } from "../app/call_tracer.jsx";

function mockItem() {
  return { call_time: 10, pid: "<0.1.0>", args: "[]", res: "result" };
}

function mockTable() {
  return [
    { id: 1, call_time: 5, pid: "<0.3.0>", args: "[1]", res: "abc" },
    { id: 2, call_time: 10, pid: "<0.2.0>", args: "[2]", res: "cba" },
    { id: 3, call_time: 15, pid: "<0.1.0>", args: "[3]", res: "bac" },
  ];
}

describe("<CallsTable />", () => {
  let callsTable = null;
  const SORTED_ASC = ".glyphicon-triangle-top";
  const SORTED_DESC = ".glyphicon-triangle-bottom";
  const ACTIVE = ".call-tracer-sort-active";
  const INACTIVE = ".call-tracer-sort-inactive";

  beforeEach(() => {
    callsTable = shallow(<CallsTable items={mockTable()} />);
  });

  it("is a table", () => {
    expect(callsTable.name()).to.equal("table");
  });

  it("has id/call_time/pid/args/res columns", () => {
    expect(callsTable.contains("No. ")).to.equal(true);
    expect(callsTable.contains("Call time ")).to.equal(true);
    expect(callsTable.contains("Pid ")).to.equal(true);
    expect(callsTable.contains("Function arguments ")).to.equal(true);
    expect(callsTable.contains("Return value ")).to.equal(true);
  });

  it("contains exactly 3 rows", () => {
    expect(callsTable.find(CallsTableRow)).to.have.length(3);
  });

  it("is sorted by id in ascending order by default", () => {
    const rows = callsTable.find(CallsTableRow);
    expect(rows.at(0).prop("item").id).to.equal(1);
    expect(rows.at(1).prop("item").id).to.equal(2);
    expect(rows.at(2).prop("item").id).to.equal(3);
  });

  it("sorts by different keys", () => {
    const headers = callsTable.find("th");
    headers.at(2).simulate("click", { preventDefault() {} });

    const rows = callsTable.find(CallsTableRow);
    expect(rows.at(0).prop("item").pid).to.equal("<0.1.0>");
    expect(rows.at(1).prop("item").pid).to.equal("<0.2.0>");
    expect(rows.at(2).prop("item").pid).to.equal("<0.3.0>");
  });

  it("changes order after clicking on the same column", () => {
    const headers = callsTable.find("th");
    headers.at(2).simulate("click", { preventDefault() {} });
    headers.at(2).simulate("click", { preventDefault() {} });

    const rows = callsTable.find(CallsTableRow);
    expect(rows.at(0).prop("item").pid).to.equal("<0.3.0>");
    expect(rows.at(1).prop("item").pid).to.equal("<0.2.0>");
    expect(rows.at(2).prop("item").pid).to.equal("<0.1.0>");
  });

  it("doesn't change order when sorting by different key", () => {
    const headers = callsTable.find("th");
    headers.at(1).simulate("click", { preventDefault() {} });
    headers.at(1).simulate("click", { preventDefault() {} });
    headers.at(2).simulate("click", { preventDefault() {} });

    const rows = callsTable.find(CallsTableRow);
    expect(rows.at(0).prop("item").pid).to.equal("<0.1.0>");
    expect(rows.at(1).prop("item").pid).to.equal("<0.2.0>");
    expect(rows.at(2).prop("item").pid).to.equal("<0.3.0>");
  });

  it("changes glyph icons in table headers", () => {
    expect(callsTable.find(SORTED_ASC)).to.have.lengthOf(1);
    expect(callsTable.find(SORTED_DESC)).to.have.lengthOf(4);

    const headers = callsTable.find("th");
    headers.at(2).simulate("click", { preventDefault() {} });

    expect(callsTable.find(SORTED_ASC)).to.have.lengthOf(0);
    expect(callsTable.find(SORTED_DESC)).to.have.lengthOf(5);
  });

  it("contains only one table header with active sort icon", () => {
    expect(callsTable.find(ACTIVE)).to.have.lengthOf(1);
    expect(callsTable.find(INACTIVE)).to.have.lengthOf(4);
  });
});

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
