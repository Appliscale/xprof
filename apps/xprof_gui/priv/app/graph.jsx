import React from "react";
import C3Chart from "react-c3js";
import CallsTracer from "./call_tracer.jsx";
import Utils from "./utils.js";

import "c3/c3.css";

import {
    AXIS,
    COLUMNS,
    COLUMNS_TO_NAMES,
    NAMES_TO_COLUMNS,
    DATA,
    GET_SAMPLES_INTERVAL,
    GRID,
    MAX_DPS,
    POINT,
    TRANSITION,
} from "./graph_constants";

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };

    this.interval = null;
    this.lastTs = 0;
    this.mounted = false;
    this.dps = [];

    this.handleClose = this.handleClose.bind(this);
    this.handleIncomingData = this.handleIncomingData.bind(this);
    this.getDataInInterval = this.getData.bind(this, this.handleIncomingData);
  }

  componentDidMount() {
    this.generateChart();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  generateChart() {
    this.getData(data => {
      const dps = (data.length)
        ? this.transformIncomingData(data)
        : [];

      if (dps.length < MAX_DPS) {
        const now = moment().unix();
        const start = now - MAX_DPS;
        const firstdps = _.first(dps);
        const current = (firstdps) ? firstdps.time / 1000 : now;
        const fill = _.range(start, current).map(time => ({
          time: time * 1000,
          min: 0,
          mean: 0,
          median: 0,
          max: 0,
          // stddev: 0,
          p25: 0,
          p50: 0,
          p75: 0,
          p90: 0,
          p99: 0,
          p9999999: 0,
          // memsize: 0,
          count: 0,
        }));
        dps.unshift(...fill);
      }

      this.dps = dps;
      this.updateChart();
      this.interval = setInterval(this.getDataInInterval, GET_SAMPLES_INTERVAL);
    });
  }

  getData(callback) {
    var mfa = this.props.mfa;
    if (!this.props.paused) {
      $.ajax({
        url: "/api/data",
        data: {
          mod: mfa[0],
          fun: mfa[1],
          arity: mfa[2],
          last_ts: this.lastTs }
      })
        .done(callback)
        .fail(() => this.setState({ error: true }));
    }
  }

  transformIncomingData(data) {
    const dps = _.sortBy(data, "time");
    this.lastTs = _.last(dps).time;
    _.forEach(dps, sample => sample.time = sample.time * 1000);
    return dps;
  }

  updateChart() {
    const fill = _.takeRight(this.dps, MAX_DPS);
    const data = Object.assign(DATA, { json: fill });
    this.refs.c3.chart.load(data);
  }

  handleClose() {
    var mfa = this.props.mfa;
    $.ajax({
      url: "/api/mon_stop",
      data: { mod: mfa[0], fun: mfa[1], arity: mfa[2] }
    }).done(() => this.props.removeGraph(mfa));
  }

  handleIncomingData(data) {
    if (this.state.error) { this.setState({ error: false }); }
    if (data.length) {
      const dps = this.transformIncomingData(data);
      this.dps = this.dps.concat(dps);
      this.updateChart();
    }
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
          <button onClick={this.handleClose} type="button"
                  className="close" data-dismiss="modal"
                  aria-label="Close"><span aria-hidden="true">&times;</span>
          </button>
          <h3 className="panel-title">{MFA[3]}{errorMsg}</h3>
        </div>
        <div className="panel-body">
          <C3Chart
            ref="c3"
            data={DATA}
            point={POINT}
            grid={GRID}
            axis={AXIS}
            transition={TRANSITION}
          />
          <div className="container-fluid">
            <br/>
            <CallsTracer mfa={MFA}/>
          </div>
        </div>
      </div>
    );
  }
}
