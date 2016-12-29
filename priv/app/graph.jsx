import "underscore";
import React from "react";

import FlotGraph from "./graph_flot.jsx";
import CallsTracer from "./call_tracer.jsx";

import Utils from "./utils.js";

const UPDATE_INTERVAL = 1000;

// 10 minutes.
const MAX_DPS = 5 * 60;

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dps: [], error: false, lastTs: 0, unomunted: true };
  }

  componentDidMount() {
    this.graph = new FlotGraph();
    this.graph.init("#" + this.chartId());

    window.addEventListener("resize", this.handleResize.bind(this));

    var ref = setInterval(this.getData.bind(this), UPDATE_INTERVAL);
    var newState = this.state;

    this.state.interval = ref;
    this.state.unmounted = false;
    this.setState(this.state);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
    window.clearInterval(this.state.interval);
    this.state.unmounted = true;
  }

  render() {
    var MFA = this.props.mfa;
    var panelType = "panel panel-default ";
    var errorMsg = "";

    if (this.state.error) {
      panelType += "panel-danger";
      errorMsg = <strong>  -  communication error</strong>;
    }

    return (
      <div className={panelType}>
        <div className="panel-heading">
          <button onClick={this.handleClose.bind(this)} type="button"
                  className="close" data-dismiss="modal"
                  aria-label="Close"><span aria-hidden="true">&times;</span>
          </button>
          <h3 className="panel-title">{Utils.formatMFA(MFA)}{errorMsg}</h3>
        </div>
        <div className="panel-body">

          <div className="container-fluid">
            <div id={this.chartId()} className="chart"></div>
            <br/>
            <CallsTracer mfa={MFA}/>
          </div>
        </div>
      </div>
    );
  }

  // Handle actions.

  handleResize(e) {
    this.graph.resize();
  }

  handleClose() {
    var mfa = this.props.mfa;

    clearInterval(this.state.interval);

    $.ajax({
      url: "/api/mon_stop",
      data: { mod: mfa[0], fun: mfa[1], arity: mfa[2] }
    }).done(() => this.props.removeGraph(mfa));
  }

  getData() {
    var mfa = this.props.mfa;
    var lastTs = this.state.lastTs;

    $.ajax({
      url: "/api/data",
      data: {
        mod: mfa[0],
        fun: mfa[1],
        arity: mfa[2],
        last_ts: lastTs }
    })
      .done(this.handleData.bind(this))
      .fail(this.handleDataError.bind(this));
  }

  handleData(data) {
    var maxAge, currData, truncData, sortedData, padding, finalData;

    maxAge = Math.floor(new Date().getTime() / 1000) - MAX_DPS;

    currData = this.state.dps.concat(data);
    sortedData = this.sortData(currData);
    truncData = this.truncrateData(maxAge, sortedData);
    padding = this.padData(maxAge, _.first(truncData).time);
    finalData = padding.concat(truncData);

    this.graph.update(finalData);

    this.state.dps = truncData;
    this.state.lastTs = _.last(sortedData).time;
    this.state.error = false;

    if (!this.unmounted) {
      this.setState(this.state);
    }
  }

  handleDataError(jqXHR, error) {
    this.state.error = true;

    if (!this.unmounted) {
      this.setState(this.state);
    }
  }

  // Helpers

  sortData(data) {
    return data.sort(function(a, b) { return a.time - b.time; });
  }

  truncrateData(maxAge, data) {
    return data.filter((val) => val.time >= maxAge);
  }

  padData(maxAge, firstTime) {
    var data = [];

    for (var i = maxAge; i < firstTime; ++i) {
      data.push({ time: i });
    }

    return data;
  }

  chartId() {
    var arity = this.props.mfa[2];

    // Guess what? Dots in module name (and Elixir modules contains it - "Elixir.Enum":map/2) are problematic for ID.
    var safe_module = this.props.mfa[0].replace(/\./g, "-");

    // And "*" is not a valid character too for an ID.
    if (arity === "*") {
      arity = "x";
    }

    return `chart_${safe_module}_${this.props.mfa[1]}_${arity}`;
  }
}
