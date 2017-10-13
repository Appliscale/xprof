import "underscore";
import React from "react";

export default class TracingSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "paused",
      pausedGraph: false
    };
  }

  componentDidMount() {
    this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000);
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.timeout);
  }

  handleClick(event) {
    if (this.state.status === "running") {
      this.props.pauseTime();
      this.setState(prevState => ({ pausedGraph: !prevState.pausedGraph }));
    }
  }

  getTracingStatus() {
    $.ajax({ url: "/api/trace_status" })
      .done((data) => {
        if (this.state.status !== data.status) {
          this.setState(prevState => ({ status: data.status }));
        }
      })
      .always(() =>
        this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000)
      );
  }

  render() {
    var symbol = "glyphicon glyphicon-";
    var btnColor = "btn btn-";
    var text = "";
    let status = this.state.status;
    const pausedGraph = this.state.pausedGraph;

    if (status === "paused" || status === "initialized" || pausedGraph) {
      text = "Trace All";
      symbol += "record";
      btnColor += "success";
    } else if (status === "running") {
      text = "Pause Time";
      symbol += "pause";
      btnColor += "danger";
    } else if (status === "overflow") {
      text = "Overflow! - resume trace all";
      symbol += "record";
      btnColor += "warning";
    }

    return (
      <form className="navbar-form navbar-left" role="search">
        <button type="button" onClick={this.handleClick.bind(this)} className={btnColor}>
          <span className={symbol} aria-hidden="true"></span> {text}
        </button>
      </form>);
  }
}
