import "underscore";
import React from "react";
import C3Chart from "react-c3js";
import CallsTracer from "./call_tracer.jsx";
import Utils from "./utils.js";

import "c3/c3.css";

const UPDATE_INTERVAL = 1000;

// 10 minutes.
const MAX_DPS = 5 * 60;

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dps: [], error: false, lastTs: 0, unomunted: true, columns: [] };
  }

  componentDidMount() {
    var ref = setInterval(this.getData.bind(this), UPDATE_INTERVAL);
    var newState = this.state;

    this.state.interval = ref;
    this.state.unmounted = false;
    this.setState(this.state);
  }

  componentWillUnmount() {
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

    const data = {
      x: "x",
      columns: this.state.columns,
      axes: {
        count: "y2"
      },
      colors: {
        count: "#98fb98",
        max: "#8c2a04",
        "99th perc": "#e24806",
        "90th perc": "#e24806",
        "75th perc": "#e26606",
        "50th perc": "#e26606",
        mean: "#ffaa00",
        min: "#d3d004",
      }
    };

    const point = { show: false };
    const grid = {
      x: { show: true },
      y: { show: true }
    };
    const axis = {
      x: { type: "timeseries", tick: { count: 10, fit: false, format: "%H:%M:%S" } },
      y2: { show: true }
    };
    const transition = { duration: 0 };

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
          <C3Chart data={data} point={point} grid={grid} axis={axis} transition={transition}/>
          <div className="container-fluid">
            <br/>
            <CallsTracer mfa={MFA}/>
          </div>
        </div>
      </div>
    );
  }

  // Handle actions.

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

    this.state.columns = this.createColumns(finalData);

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

  createColumns(data) {
    let columns = [
      [ "x" ], [ "count" ], [ "max" ], [ "99th perc" ], [ "90th perc" ],
      [ "75th perc" ], [ "50th perc" ], [ "mean" ], [ "min" ]
    ];
    let zu = function(v) {
      if (v === undefined) {
        return 0;
      } else {
        return v;
      }
    };
    for (let d of data) {
      columns[0].push(zu(d.time) * 1000);
      columns[1].push(zu(d.count));
      columns[2].push(zu(d.max));
      columns[3].push(zu(d.p99));
      columns[4].push(zu(d.p90));
      columns[5].push(zu(d.p75));
      columns[6].push(zu(d.p50));
      columns[7].push(zu(d.mean));
      columns[8].push(zu(d.min));
    }
    return columns;
  }
}
