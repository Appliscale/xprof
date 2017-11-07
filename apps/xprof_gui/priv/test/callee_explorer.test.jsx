// eslint-env: mocha

import React from "react";
import ReactTestUtils from "react-addons-test-utils";
import { shallow } from "enzyme";
import { expect } from "chai";
import CalleeExplorer from "../app/callee_explorer.jsx";

describe("<CalleeExplorer />", () => {
  let calleeExplorer = null;

  const MFAs = [
    [ "lists", "reverse", 1 ],
    [ "lists", "reverse", 2 ],
    [ "mock", "function", 3 ]
  ];

  let functions = [];
  for (var MFA of MFAs) {
    functions.push(MFA[0] + ":" + MFA[1] + "/" + MFA[2]);
  }

  beforeEach(() => {
    calleeExplorer = shallow(<CalleeExplorer />);
  });

  it("is a div", () => {
    expect(calleeExplorer.name()).to.equal("div");
  });

  it("shows message while being empty", () => {
    expect(calleeExplorer.contains("This function has no callees to explore.")).to.equal(true);
  });

  it("contains as many buttons as callees", () => {
    calleeExplorer.setState({ callees: MFAs });
    const buttons = calleeExplorer.find("button");
    expect(buttons.length).to.equal(MFAs.length);
  });

  it("contains buttons with formatted MFAs", () => {
    calleeExplorer.setState({ callees: MFAs });
    const buttons = calleeExplorer.find("button");

    for (var i = 0; i < functions.length; ++i) {
      expect(buttons.at(i).prop("value")).to.equal(functions[i]);
    }
  });
});
