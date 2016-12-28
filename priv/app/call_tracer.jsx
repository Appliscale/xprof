import "underscore";
import React from "react";

import FlotGraph from "./graph_flot.jsx";

class CallsTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    let item = this.props.item;
    let dir = this.state.expanded ? "down" : "right";
    let rowType = this.state.expanded ? "expanded" : "normal";

    return (
      <tr data-expanded={this.state.expanded} className={`row-${rowType}`}>
        <td>
          <button onClick={this.handleClick.bind(this)} type="button"
            className="btn btn-default">
            <span className={`expand-chevron glyphicon glyphicon-chevron-${dir}`}
              aria-hidden="true">
            </span>
          </button>
        </td>
        <td>{item.call_time} &micro;s</td>
        <td>{item.pid}</td>
        <td style={{ maxWidth: "500px" }}>
          <div className="code-longbox" style={{ margin: 0 }}>
            {item.args}
          </div>
        </td>
        <td style={{ maxWidth: "500px" }}>
          <div className="code-longbox" style={{ margin: 0 }}>
            {item.res}
          </div>
        </td>
      </tr>);
  }
}

class CallsTable extends React.Component {
  render() {
    return (
      <table className="table table-hover table-striped">
        <thead>
          <th></th>
          <th>Call time</th>
          <th>Pid</th>
          <th>Args</th>
          <th>Response</th>
        </thead>
        <tbody>
          {this.props.items.map((item) =>
            <CallsTableRow key={item.id} item={item}/>
          )}
        </tbody>
      </table>
    );
  }
}

class StartStopButton extends React.Component {
  onClick(e) {
    e.preventDefault();

    if (!this.props.disabled) {
      if (this.props.started) {
        this.props.onStop && this.props.onStop();
      } else {
        this.props.onStart && this.props.onStart();
      }
    }
  }

  render() {
    const disabled = this.props.disabled;
    const started = this.props.started;

    if (started) {
      return (
        <button type="submit" onClick={this.onClick.bind(this)}
          className="btn btn-danger" disabled={disabled}>
          Stop
        </button>);
    } else {
      return (
        <button type="submit" onClick={this.onClick.bind(this)}
          className="btn btn-success" disabled={disabled}>
        Start
      </button>);
    }
  }
}

export default class CallsTracer extends React.Component {
  constructor(props) {
    super(props);

    this.Status = { STOPPED: 0, RUNNING: 1 };

    this.state = {
      capture_id: null,
      offset: 0,
      items: [],
      threshold_value: null,
      limit_value: null,
      status: this.Status.STOPPED
    };
  }

  componentDidMount() {
    this.getCaptureData();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutRef);
  }

  handleCaptureStart() {
    let fun = this.props.fun;
    let threshold = this.state.threshold_value || this.props.defaultThreshold;
    let limit = this.state.limit_value || this.props.defaultLimit;

    this.setState({ status: this.Status.RUNNING });

    $.ajax({
      url: "/api/capture",
      data: {
        mod: fun[0], fun: fun[1], arity: fun[2],
        threshold: threshold,
        limit: limit
      }
    }).success((response) => {
      this.state.capture_id = response.capture_id;
      this.state.offset = 0;
      this.state.items = [];
      this.setState(this.state);
      this.getCaptureData();
    });
  }

  handleCaptureStop() {
    let fun = this.props.fun;
    $.ajax({
      url: "api/capture_stop",
      data: {
        mod: fun[0], fun: fun[1], arity: fun[2]
      }
    }).success((response) =>
      this.setState({ status: this.Status.STOPPED })
    );
  }

  getCaptureData() {
    var fun = this.props.fun;

    $.ajax({
      url: "/api/capture_data",
      data: {
        mod: fun[0], fun: fun[1], arity: fun[2],
        offset: this.state.offset
      }
    }).done(function(data, textStatus, jqXHR) {
      if (jqXHR.status === 200) {
        if (this.state.capture_id !== data.capture_id) {
          this.state.items = [];
          if (data.threshold > 0) { this.state.threshold_value = data.threshold; };
          if (data.limit > 0) { this.state.limit_value = data.limit; };
          this.state.offset = 0;
        } else {
          const sortedItems = data.items.sort();
          const lastId = sortedItems.length === 0 ? this.state.offset : _.last(sortedItems).id;
          this.state.offset = lastId;
          this.state.items = this.state.items.concat(sortedItems);
        }

        this.state.capture_id = data.capture_id;
        this.state.status = data.has_more ? this.Status.RUNNING : this.Status.STOPPED;

      } else if (jqXHR.status !== 404) {
        this.state.status = this.Status.STOPPED;
      }

      this.state.timeoutRef = setTimeout(this.getCaptureData.bind(this), 750);
      this.setState(this.state);
    }.bind(this));
  }

  handleChange(id, event) {
    event.preventDefault();
    if (id === "threshold") {
      this.setState({ threshold_value: event.target.value });
    } else if (id === "limit") {
      this.setState({ limit_value: event.target.value });
    }

    return true;
  }

  isPostiveIntegerSmallerThan(value, upperLimit) {
    const numVal = Number(value);
    if (Number.isInteger(numVal)) {
      return numVal <= upperLimit && numVal > 0;
    }

    return false;
  }

  render() {
    let thresholdClass = "";
    let limitClass = "";
    let error = false;

    const limitVal = this.state.limit_value;
    if (limitVal && !this.isPostiveIntegerSmallerThan(limitVal, 100)) {
        limitClass = "has-error";
        error = true;
    }

    const thresholdVal = this.state.threshold_value;
    if (thresholdVal && !this.isPostiveIntegerSmallerThan(thresholdVal, 1000000)) {
        thresholdClass = "has-error";
        error = true;
    }

    const started = this.state.status === this.Status.RUNNING;

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Slow calls tracing
        </div>
        <div className="panel-body">
          <form className="form-inline">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-addon">Treshold</div>
                <span className={thresholdClass}>
                <input ref="thresholdInput" type="text" className="form-control"
                  id="tresholdInput" placeholder={this.props.defaultThreshold}
                  value={this.state.threshold_value}
                  onChange={this.handleChange.bind(this, "threshold")}
                  disabled={started}/>
                </span>
                <div className="input-group-addon">ms</div>
              </div>
            </div>
            <span></span>
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-addon">Limit</div>
                <span className={limitClass}>
                <input ref="limitInput" type="text" className="form-control"
                  id="limitInput" placeholder={this.props.defaultLimit}
                  value={this.state.limit_value}
                  onChange={this.handleChange.bind(this, "limit")}
                  disabled={started}/>
                </span>
                <div className="input-group-addon">calls</div>
              </div>
            </div>
            <span>
              <StartStopButton disabled={error} started={started}
                onStart={this.handleCaptureStart.bind(this)}
                onStop={this.handleCaptureStop.bind(this)}/>
            </span>
          </form>
        </div>
        <CallsTable items={this.state.items}/>
      </div>
    );
  }
}
