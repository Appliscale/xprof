import React from "react";
import C3Chart from "react-c3js";
import CallsTracer from "./call_tracer.jsx";
import Utils from "./utils.js";

import "c3/c3.css";

import {
  COLUMNS,
  POINT,
  GRID,
  AXIS,
  TRANSITION,
  DATA,
  MAX_DPS,
  GET_SAMPLES_INTERVAL
} from "./graph_constants";

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false, columns: [
      [ COLUMNS.time ],
      [ COLUMNS.count ],
      [ COLUMNS.max ],
      [ COLUMNS.p99 ],
      [ COLUMNS.p90 ],
      [ COLUMNS.p75 ],
      [ COLUMNS.p50 ],
      [ COLUMNS.mean ],
      [ COLUMNS.min ] ]
    };

    this.interval = null;
    this.lastTs = 0;
    this.dps = [];
    this.mounted = false;

    this.handleClose = this.handleClose.bind(this);
    this.getData = this.getData.bind(this);
    this.handleData = this.handleData.bind(this);
    this.handleDataError = this.handleDataError.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.interval = setInterval(this.getData, GET_SAMPLES_INTERVAL);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleClose() {
    clearInterval(this.interval);
    var mfa = this.props.mfa;
    $.ajax({
      url: "/api/mon_stop",
      data: { mod: mfa[0], fun: mfa[1], arity: mfa[2] }
    }).done(() => this.props.removeGraph(mfa));
  }

  getData() {
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
        .done(this.handleData)
        .fail(this.handleDataError);
    }
  }

  handleData(data) {
    const sortedIncomingData = _.sortBy(data, "time");
    const concatenatedData = this.dps.concat(sortedIncomingData);
    const nextDps = _.takeRight(concatenatedData, MAX_DPS);

    if (nextDps.length < MAX_DPS) {
      // Fill begining of the graph wit zeros
      const now = moment().unix();
      const graphStart = now - MAX_DPS;
      const firstDps = _.first(nextDps).time;
      const toadd = _.range(graphStart, firstDps).map(time => ({
        count: 0,
        max: 0,
        mean: 0,
        median: 0,
        memsize: 0,
        min: 0,
        p25: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p99: 0,
        p9999999: 0,
        stddev: 0,
        time: time,
      }));
      nextDps.unshift(...toadd);
    }

    const onlyOneSample = sortedIncomingData.length === 1 && nextDps.length === MAX_DPS;
    const nextColumns = this.updateColumns(nextDps, onlyOneSample);

    this.lastTs = _.last(nextDps).time;
    this.dps = nextDps;

    if (this.mounted) { this.setState({ columns: nextColumns, error: false }); }
  }

  handleDataError(jqXHR, error) {
    if (this.mounted) { this.setState({ error: true }); }
  }

  updateColumns(data, onlyOneSample) {
    const columns = [];
    _.forEach(this.state.columns, column => {
      const columnKey = column.shift();
      const updatedColumn = (onlyOneSample)
        ? this.updateWithOneSample(data, column, columnKey)
        : data.map(sample => (columnKey === "time") ? sample[columnKey] * 1000 : sample[columnKey]);
      columns.push([ columnKey, ...updatedColumn ]);
    });
    return columns;
  }

  updateWithOneSample(data, column, columnKey) {
    column.shift();
    const incomingValue = (columnKey === "time")
      ? _.last(data)[columnKey] * 1000
      : _.last(data)[columnKey];
    return [ ...column, incomingValue ];
  }

  render() {
    var MFA = this.props.mfa;
    var panelType = "panel panel-default ";
    var errorMsg = "";

    if (this.state.error) {
      panelType += "panel-danger";
      errorMsg = <strong>  -  communication error</strong>;
    }

    const data = Object.assign(DATA, { columns: this.state.columns });

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
          <C3Chart data={data} point={POINT} grid={GRID} axis={AXIS} transition={TRANSITION}/>
          <div className="container-fluid">
            <br/>
            <CallsTracer mfa={MFA}/>
          </div>
        </div>
      </div>
    );
  }
}
