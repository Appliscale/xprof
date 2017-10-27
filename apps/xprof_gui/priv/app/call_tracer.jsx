import _ from "lodash";
import React from "react";

export class CallsTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
    this.handleClick = this.handleClick.bind(this);
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
          <button onClick={this.handleClick} type="button"
            className="btn btn-default">
            <span className={`expand-chevron glyphicon glyphicon-chevron-${dir}`}
              aria-hidden="true">
            </span>
          </button>
        </td>
        <td>{item.id}</td>
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
      </tr>
    );
  }
}

export class CallsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortby: "id",
      order: "asc"
    };

    this.onClickId = this.onClick.bind(this, "id");
    this.onClickTime = this.onClick.bind(this, "call_time");
    this.onClickPid = this.onClick.bind(this, "pid");
    this.onClickArgs = this.onClick.bind(this, "args");
    this.onClickRes = this.onClick.bind(this, "res");
  }

  onClick(id, event) {
    event.preventDefault();

    const isColumnActive = (this.state.sortby === id);
    const newOrder = (this.state.order === "desc" && isColumnActive) ? "asc" : "desc";

    this.setState({
      sortby: id,
      order: newOrder
    });
  }

  sortIcon(id) {
    const isActive = (this.state.sortby === id);
    const dir = (isActive && this.state.order === "asc") ? "top" : "bottom";

    const glyphiconStyle = "glyphicon glyphicon-triangle-" + dir;
    const callTracerStyle = " call-tracer-sort-" + (isActive ? "active" : "inactive");
    const style = glyphiconStyle + callTracerStyle;

    return (
      <span className={style}></span>
    );
  }

  render() {
    let items = _.sortBy(this.props.items, this.state.sortby);
    if (this.state.order === "desc") {
      items.reverse();
    }

    return (
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th></th>
            <th onClick={this.onClickId}>No. {this.sortIcon("id")}</th>
            <th onClick={this.onClickTime}>Call time {this.sortIcon("call_time")}</th>
            <th onClick={this.onClickPid}>Pid {this.sortIcon("pid")}</th>
            <th onClick={this.onClickArgs}>Function arguments {this.sortIcon("args")}</th>
            <th onClick={this.onClickRes}>Return value {this.sortIcon("res")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            <CallsTableRow key={item.id} item={item}/>
          )}
        </tbody>
      </table>
    );
  }
}

class StartStopButton extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.disabled !== nextProps.disabled ||
      this.props.started !== nextProps.started;
  }

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
        <button type="submit" onClick={this.onClick}
          className="btn btn-danger" disabled={disabled}>
          Stop
        </button>
      );
    } else {
      return (
        <button type="submit" onClick={this.onClick}
          className="btn btn-success" disabled={disabled}>
          Start
        </button>
      );
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

    this.timeout = null;

    this.handleCaptureStart = this.handleCaptureStart.bind(this);
    this.handleCaptureStop = this.handleCaptureStop.bind(this);
    this.handleChangeTreshold = this.handleChange.bind(this, "threshold");
    this.handleChangeLimit = this.handleChange.bind(this, "limit");
    this.getCaptureData = this.getCaptureData.bind(this);
    this.handleCaptureCall = this.handleCaptureCall.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.mfa[3] !== nextProps.mfa[3] ||
      this.state !== nextState;
  }

  componentDidMount() {
    this.getCaptureData();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleCaptureStart() {
    let mfa = this.props.mfa;
    let threshold = this.state.threshold_value;
    let limit = this.state.limit_value;

    $.ajax({
      url: "/api/capture",
      data: {
        mod: mfa[0], fun: mfa[1], arity: mfa[2],
        threshold: threshold,
        limit: limit }
    }).done((response) => {
      this.setState({
        status: this.Status.RUNNING,
        capture_id: response.capture_id,
        offset: 0,
        items: [],
      });
      this.getCaptureData();
    });
  }

  handleCaptureStop() {
    let mfa = this.props.mfa;
    $.ajax({
      url: "api/capture_stop",
      data: { mod: mfa[0], fun: mfa[1], arity: mfa[2] }
    }).done((response) => this.setState({ status: this.Status.STOPPED }));
  }

  getCaptureData() {
    var mfa = this.props.mfa;

    $.ajax({
      url: "/api/capture_data",
      data: {
        mod: mfa[0], fun: mfa[1], arity: mfa[2],
        offset: this.state.offset
      }
    }).done(this.handleCaptureCall);
  }

  handleCaptureCall(data, textStatus, jqXHR) {
    if (jqXHR.status === 200) {
      // Capturing / not-capturing
      const nextStatus = data.has_more ? this.Status.RUNNING : this.Status.STOPPED;
      // Capturing has begun
      if (this.state.capture_id !== data.capture_id) {
        this.setState({
          capture_id: data.capture_id,
          status: nextStatus,
          items: [],
          offset: 0,
          threshold_value: (data.threshold >= 0) ? data.threshold : null,
          limit_value: (data.limit > 1) ? data.limit : null,
        });
      // Backend returned some slow calls
      } else if (data.items.length) {
        const offset = _.last(data.items).id;
        // Find intersection to exclude duplicates slow calls
        const setItems = _.uniqBy(this.state.items.concat(data.items), "id");
        this.setState({
          capture_id: data.capture_id,
          items: setItems,
          offset: offset,
        });
      // Capturing has been stopped
      // (when started capture_id receives new value which is checked as first)
      } else if (this.state.status !== nextStatus) {
        this.setState({
          status: nextStatus
        });
      }
    }
    this.timeout = setTimeout(this.getCaptureData, 750);
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

  isIntegerInRange(value, lowerLimit, upperLimit) {
    const numVal = Number(value);
    if (Number.isInteger(numVal)) {
      return numVal <= upperLimit && numVal >= lowerLimit;
    }

    return false;
  }

  render() {
    let error = false;
    const limit = this.state.limit_value;
    if (limit && !this.isIntegerInRange(limit, 1, 100)) {
      var limitClass = "has-error";
      error = true;
    }

    const threshold = this.state.threshold_value;
    if (threshold && !this.isIntegerInRange(threshold, 0, 1000000)) {
      var thresholdClass = "has-error";
      error = true;
    }

    const atLeastOneEmptyInput = !threshold || !limit;
    const started = this.state.status === this.Status.RUNNING;
    const buttonDisabled = error || atLeastOneEmptyInput;

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
                  id="tresholdInput" placeholder={"0 - 1000000"}
                  value={this.state.threshold_value || ""}
                  onChange={this.handleChangeTreshold}
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
                  id="limitInput" placeholder={"1 - 100"}
                  value={this.state.limit_value || ""}
                  onChange={this.handleChangeLimit}
                  disabled={started}/>
                </span>
                <div className="input-group-addon">calls</div>
              </div>
            </div>
            <span>
              <StartStopButton
                disabled={buttonDisabled}
                started={started}
                onStart={this.handleCaptureStart}
                onStop={this.handleCaptureStop}
              />
            </span>
          </form>
        </div>
        <CallsTable items={this.state.items} />
      </div>
    );
  }
}
