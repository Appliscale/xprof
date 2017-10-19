import "underscore";
import React from "react";

export default class TracingSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "paused",
      paused: false,
    };
    this.getTracingStatus = this.getTracingStatus.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.state.timeout = window.setTimeout(this.getTracingStatus, 1000);
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.timeout);
  }

  handleClick(event) {
    var spec = this.state.status === "running" ? "pause" : "all";
    $.ajax({
      url: "/api/trace_set",
      data: { spec: spec }
    })
      .fail((jqXHR, textStatus, errorThrown) => console.error("Cant set tracing", errorThrown))
      .always(() => {
        clearTimeout(this.state.timeout);
        this.getTracingStatus();
      });
  }

  getTracingStatus() {
    $.ajax({
      url: "/api/trace_status"
    })
      .done((data) => {
        if (this.state.status !== data.status) {
          const shouldPause = data.status !== "running";
          this.setState((prevState, props) => {
            let newState = {};
            if (prevState.paused !== shouldPause) {
              props.toggleTimeOnGraph();
              newState = {
                status: data.status,
                paused: shouldPause,
              };
            } else {
              newState = { status: data.status };
            }
            return newState;
          });
        }
      })
      .always(() =>
        this.state.timeout = window.setTimeout(this.getTracingStatus, 1000)
      );
  }

  render() {
    var symbol = "glyphicon glyphicon-";
    var btnColor = "btn btn-";
    var text = "";
    let status = this.state.status;

    if (status === "running") {
      text = "Pause Time";
      symbol += "pause";
      btnColor += "danger";
    } else if (status === "paused" || status === "initialized") {
      text = "Trace All";
      symbol += "record";
      btnColor += "success";
    } else if (status === "overflow") {
      text = "Overflow! - resume trace all";
      symbol += "record";
      btnColor += "warning";
    }

    return (
      <form className="navbar-form navbar-left" role="search">
        <button type="button" onClick={this.handleClick} className={btnColor}>
          <span className={symbol} aria-hidden="true"></span> {text}
        </button>
      </form>);
  }
}
