import React from 'react';
import 'underscore';

export default class TracingSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {tracing: false};
  }

  componentDidMount() {
    this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this),1000);
  }

  componentDidUnmount() {
    window.clearTimeout(this.state.timeout);
  }

  handleClick(event) {
    var spec = this.state.tracing ? "pause" : "all";

    $.ajax({
      url: "/api/trace_set",
      data: {spec: spec}
    })
    .error((jqXHR, errorcode) => console.error("Cant set tracing", errorcode))
    .always(function() {
	    clearTimeout(this.state.timeout);
	    this.getTracingStatus()
    }.bind(this))
  }

  getTracingStatus() {
    $.ajax({url: "/api/trace_status"}).done(function(data) {
      this.state.tracing = data.tracing;
      this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000);
      this.setState(this.state);
    }.bind(this))
  }

  render() {
    var symbol   = "glyphicon glyphicon-" + (this.state.tracing ? "pause" : "record");
    var btnColor = "btn btn-" + (this.state.tracing ? "danger" : "success");
    var text     = this.state.tracing ? "Pause tracing" : "Trace all";

    return (
      <form className="navbar-form navbar-left" role="search">
	<button type="button" onClick={this.handleClick.bind(this)} className={btnColor}>
	  <span className={symbol} aria-hidden="true"></span> {text}
	</button>
      </form>)
  }
}
