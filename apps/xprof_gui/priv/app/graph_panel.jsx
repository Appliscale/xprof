import React from "react";
import Graph from "./graph.jsx";

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funs: [],
      paused: false
    };
    this.removeGraph = this.removeGraph.bind(this);
    this.getFunsList = this.getFunsList.bind(this);
    this.handleFuns = this.handleFuns.bind(this);
    this.handleFunsError = this.handleFunsError.bind(this);
  }

  componentDidMount() {
    window.setTimeout(this.getFunsList, 500);
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
    const index = this.state.funs.indexOf(mfa);
    if (index > -1) {
      this.setState({ funs: this.state.funs.splice(index, 1) });
    }
  }

  getFunsList() {
    $.ajax({
      url: "/api/mon_get_all" }
    )
      .done(this.handleFuns)
      .fail(this.handleFunsError);
  }

  handleFuns(data) {
    if (!_.isEqual(this.state.funs, data)) {
      this.setState({ funs: data });
    }
    window.setTimeout(this.getFunsList, 500);
  }

  handleFunsError(jqXHR, error) {
    window.setTimeout(this.getFunsList, 1000);
  }

  toggleTimeOnGraph() {
    this.setState({ paused: !this.state.paused });
  }

  render() {
    var funs = this.state.funs;
    var paused = this.state.paused;

    var graphsPanels = [];
    for (var i = 0; i < funs.length; i++) {
      graphsPanels.push(
        <div key={funs[i][3]} className="row">
          <div className="col-md-12">
            <Graph
              removeGraph={this.removeGraph}
              mfa={funs[i]}
              paused={paused}
            />
          </div>
        </div>
      );
    }

    return (<div className="container-fluid">{graphsPanels}</div>);
  }
}
