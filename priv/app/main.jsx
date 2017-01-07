import "jquery";
import ReactDOM from "react-dom";
import React from "react";

import "Flot";
import "bootswatch/flatly/bootstrap.css";

import Graph from "./graph.jsx";
import TracingSwitch from "./tracing_switch.jsx";
import GraphPanel from "./graph_panel.jsx";
import FunctionBrowser from "./function_browser.jsx";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  addGraph(query) {
    this.refs.graphPanel.addGraph(query);
  }

  clearFunctionBrowser() {
    this.refs.functionBrowser.clear();
  }

  render() {
    return (
      <div className="container-fluid">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">
              <img src="img/xprof_logo.png" height="45px"/>
            </a>
          </div>

          <div className="navbar-collapse collapse" id="navbar-collapsible">
            <TracingSwitch/>
            <FunctionBrowser ref="functionBrowser" addGraph={this.addGraph.bind(this)}/>
          </div>
        </nav>
        <GraphPanel ref="graphPanel" clearFunctionBrowser={this.clearFunctionBrowser.bind(this)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById("main-container")
);
