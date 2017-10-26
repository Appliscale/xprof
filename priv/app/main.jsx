import "jquery";
import ReactDOM from "react-dom";
import React from "react";

import "bootswatch/flatly/bootstrap.css";

import Graph from "./graph.jsx";
import TracingSwitch from "./tracing_switch.jsx";
import GraphPanel from "./graph_panel.jsx";
import FunctionBrowser from "./function_browser.jsx";
import Utils from "./utils.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: null
    };

    this.modeSuccess = this.modeSuccess.bind(this);
    this.addGraph = this.addGraph.bind(this);
    this.clearFunctionBrowser = this.clearFunctionBrowser.bind(this);
    this.toggleTimeOnGraph = this.toggleTimeOnGraph.bind(this);

    $.getJSON("/api/mode", {}, this.modeSuccess);
  }

  modeSuccess(data) {
    this.setState({ mode: data.mode });
    $("#favicon").attr("href", `img/xprof_icon_${data.mode}.png`);
  }

  addGraph(query) {
    this.refs.graphPanel.addGraph(query);
  }

  clearFunctionBrowser() {
    this.refs.functionBrowser.clear();
  }

  toggleTimeOnGraph() {
    this.refs.graphPanel.toggleTimeOnGraph();
  }

  render() {
    let guides = Utils.getLanguageGuides(this.state.mode);

    return (
      <div className="container-fluid">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">
              <img src="img/xprof_logo.png" height="45px"/>
            </a>
          </div>

          <div className="navbar-collapse collapse" id="navbar-collapsible">
            <TracingSwitch toggleTimeOnGraph={this.toggleTimeOnGraph}/>
            <FunctionBrowser
              ref="functionBrowser"
              addGraph={this.addGraph}
              language={guides.language}
              type={guides.type}
              example={guides.example}
            />
          </div>
        </nav>
        <GraphPanel ref="graphPanel" clearFunctionBrowser={this.clearFunctionBrowser}/>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById("main-container")
);
