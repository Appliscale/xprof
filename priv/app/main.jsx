import React from 'react';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import d3 from 'd3';
import c3 from 'c3/c3';
import 'flot';
import Graph from './graph.jsx'
import TracingSwitch from './tracing_switch.jsx'
import GraphPanel from './graph_panel.jsx'
import FunctionBrowser from './function_browser.jsx'

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  addGraph(fun) {
    this.refs.graphPanel.addGraph(fun);
    this.refs.functionBrowser.clear();
  }

  render() {
    return (
      <div className="container-fluid">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">XProf</a>
          </div>

          <div className="navbar-collapse collapse" id="navbar-collapsible">
            <TracingSwitch/>
            <FunctionBrowser ref='functionBrowser' addGraph={this.addGraph.bind(this)}/>
          </div>
        </nav>
        <GraphPanel ref='graphPanel'/>
      </div>
    );
  }
}

React.render(
  <App/>,
  document.getElementById('main-container')
);
