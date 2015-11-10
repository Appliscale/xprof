import React from 'react';
import 'underscore';
import FlotGraph from  "./graph_flot.jsx"
import CallsTracer from "./call_tracer.jsx"

const UPDATE_INTERVAL = 1000;
const MAX_DPS = 5 * 60; //10 minutes

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dps: [], error: false, lastTs: 0};
  }

  componentDidMount() {
    this.graph = new FlotGraph();
    this.graph.init("#" +this.chartId());

    window.addEventListener('resize', this.handleResize.bind(this));

    var ref = setInterval(this.getData.bind(this), UPDATE_INTERVAL);
    var newState = this.state;
    this.state.interval = ref;
    this.setState(this.state);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  render() {
    var fun = this.props.fun;
    var panelType = "panel panel-default ";
    var errorMsg = "";

    if(this.state.error) {
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
          <h3 className="panel-title">{fun[0]}:{fun[1]}/{fun[2]}{errorMsg}</h3>
        </div>
        <div className="panel-body">

          <div className="container-fluid">
            <div id={this.chartId()} className="chart"></div>
            <br/>
	    <CallsTracer fun={fun} />
          </div>
        </div>
      </div>
    )
  }

  // Handle actions

  handleResize(e) {
    this.graph.resize();
  }

  handleClose() {
    var fun = this.props.fun;
    clearInterval(this.state.interval);
    $.ajax({
      url: "/api/mon_stop",
      data: {mod: fun[0], fun: fun[1], arity: fun[2]}
    }).done((
      ()=>this.props.removeGraph(fun)
    ).bind(this));
  }

  getData() {
    var fun = this.props.fun;
    var lastTs = this.state.lastTs;

    $.ajax({
      url: "/api/data",
      data: {
        mod: fun[0],
        fun: fun[1],
        arity: fun[2],
        last_ts: lastTs
      },
      success: this.handleData.bind(this),
      error: this.handleDataError.bind(this)})
  }

  handleData(data) {
    var maxAge, currData, truncData, sortedData, padding, finalData;

    maxAge = Math.floor(new Date().getTime()/1000) - MAX_DPS;

    currData = this.state.dps.concat(data);
    sortedData = this.sortData(currData);
    truncData = this.truncrateData(maxAge, sortedData);
    padding = this.padData(maxAge, _.first(truncData).time);
    finalData = padding.concat(truncData);

    this.graph.update(finalData);

    this.state.dps = truncData;
    this.state.lastTs = _.last(sortedData).time;
    this.state.error = false;
    this.setState(this.state);
  }

  handleDataError(jqXHR, error) {
    this.state.error = true;
    this.setState(this.state);
  }

  // Helpers

  sortData(data) {
    return data.sort(function(a,b) { return a.time - b.time });
  }

  truncrateData(maxAge, data) {
    return data.filter((val) => val.time >= maxAge );
  }

  padData(maxAge, firstTime) {
    var data = [];
    for(var i=maxAge;i<firstTime; i++)
      data.push({time:i});
    return data;
  }

  chartId() {
    return `chart_${this.props.fun[0]}_${this.props.fun[1]}_${this.props.fun[2]}`
  }
}
