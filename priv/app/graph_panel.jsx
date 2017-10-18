import React from "react";

import Graph from "./graph.jsx";

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funs: [],
      paused: false
    };
  }

  componentDidMount() {
    this.funsInterval = window.setTimeout(this.getFunsList.bind(this), 500);
  }

  componentWillUnmount() {
    window.clearTimeout(this.interval);
  }

  // Getting data
  startMonitoring(query) {
    $.ajax({
      url: "/api/mon_start",
      data: { query: query }
    }).done(() => {
      this.props.clearFunctionBrowser();
      this.getFunsList();
    });
  }

  addGraph(query) {
    this.startMonitoring(query);
  }

  removeGraph(mfa) {
    var newState = this.state;
    var index = this.state.funs.indexOf(mfa);
    if (index > -1) {
      newState.funs.splice(index, 1);
    }
    this.setState(newState);
  }

  getFunsList() {
    $.ajax({
      url: "/api/mon_get_all" }
    )
      .done(this.handleFuns.bind(this))
      .fail(this.handleFunsError.bind(this));
  }

  handleFuns(data) {
    if (this.state.funs.length !== data.length) {
      this.setState({ funs: data });
    }
    window.setTimeout(this.getFunsList.bind(this), 500);
  }

  handleFunsError(jqXHR, error) {
    window.setTimeout(this.getFunsList.bind(this), 1000);
  }

  pauseTime() {
    this.setState({ paused: !this.state.paused });
  }

  render() {
    var funs = this.state.funs;
    var paused = this.state.paused;

    var graphsPanels = [];
    for (var i = 0; i < funs.length; i++) {
      graphsPanels.push(
        <div key={funs[i]} className="row">
          <div className="col-md-12">
            <Graph removeGraph={this.removeGraph.bind(this)} mfa={funs[i]}
            paused={paused}/>
          </div>
        </div>
      );
    }

    return (<div className="container-fluid">{graphsPanels}</div>);
  }
}
