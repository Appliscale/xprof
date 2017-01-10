import "underscore";
import React from "react";

export default class TracingSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tracing: false, overflow: false };
  }

  componentDidMount() {
    this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000);
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.timeout);
  }

  handleClick(event) {
    var spec = this.state.tracing && !this.state.overflow ? "pause" : "all";

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
    $.ajax({ url: "/api/trace_status" })
      .done((data) => {
        this.state.tracing = data.tracing;
        this.state.overflow = data.overflow;
        this.setState(this.state);
      })
      .always(() =>
        this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000)
      );
  }

  render() {
    var symbol = "glyphicon glyphicon-" + (this.state.tracing ? "pause" : "record");
    var btnColor = "btn btn-" + (this.state.tracing ? "danger" : "success");
    var text = "Pause tracing";
    if (this.state.overflow) {
      text = "Overflow! - resume trace all";
      btnColor = "btn btn-warning";
    } else if (!this.state.tracing) {
      text = "Trace all";
    }

    return (
      <form className="navbar-form navbar-left" role="search">
        <button type="button" onClick={this.handleClick.bind(this)} className={btnColor}>
          <span className={symbol} aria-hidden="true"></span> {text}
        </button>
      </form>);
  }
}
