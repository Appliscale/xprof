import React from 'react';
import 'underscore';
import FlotGraph from  "./graph_flot.jsx"

export default class CallsTracer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      capture_id:null,
      offset: 0,
      items: []
    };
  }

  componentDidMount() {
    this.getCaptureData();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutRef);
  }

  handleClick(e) {
    e.preventDefault();

    var fun = this.props.fun;
    var threshold = $(React.findDOMNode(this.refs.thresholdInput)).val();
    var limit = $(React.findDOMNode(this.refs.limitInput)).val();

    $.ajax({
      url: "/api/capture",
      data: {
        mod: fun[0], fun: fun[1], arity: fun[2],
        threshold: threshold,
        limit: limit
      }
    }).success(function(e) {
      this.state.capture_id = e.capture_id;
      this.state.offset = 0;
      this.setState(this.state);
      this.getCaptureData();

    }.bind(this));
  }

  handleRowExpandClick(ref, e) {
    e.preventDefault();
    var target_row = React.findDOMNode(this.refs[ref]);

    if($(target_row).data("expanded")) {
      $(target_row).data("expanded", false);
      $(target_row).removeClass("row-expanded");
      $(target_row).addClass("row-normal");
      $(".expand-chevron", target_row).removeClass("glyphicon-chevron-down");
      $(".expand-chevron", target_row).addClass("glyphicon-chevron-right");
    } else {
      $(target_row).data("expanded", true);
      $(target_row).removeClass("row-normal");
      $(target_row).addClass("row-expanded");
      $(".expand-chevron", target_row).removeClass("glyphicon-chevron-right");
      $(".expand-chevron", target_row).addClass("glyphicon-chevron-down");
    }
  }

  getCaptureData() {
    var fun = this.props.fun;

    $.ajax({
      url: "/api/capture_data",
      data: {
        mod: fun[0], fun: fun[1], arity: fun[2],
        offset: this.state.offset
      }
    }).success(function(e) {
      var sortedItems = e.items.sort();
      var lastId = sortedItems.length == 0 ? this.state.offset : _.last(sortedItems).id;

      this.state.threshold = e.threshold;

      if(this.state.capture_id == e.capture_id) {
        Array.prototype.push.apply(this.state.items, sortedItems);
        this.state.offset    = lastId;
      }
      else{
        this.state.capture_id = e.capture_id;
        this.state.offset = lastId;
        this.state.items = sortedItems;
      }

      this.setState(this.state);

    }.bind(this)).done(function() {
      this.state.timeoutRef = setTimeout(this.getCaptureData.bind(this),1000);
    }.bind(this));
  }

  render() {
    var items = [];
    for(var i=0;i < this.state.items.length;i++) {
      var item = this.state.items[i];
      var ref = this.state.capture_id + "_" + item.id;
      items.push(
        <tr key={ref} ref={ref} data-expanded="false" className="row-normal">
          <td>
            <button onClick={this.handleRowExpandClick.bind(this,ref)} type="button"
                    className="btn btn-default">
              <span className="expand-chevron glyphicon glyphicon-chevron-right"
                    aria-hidden="true">
              </span>
            </button>
          </td>
          <td>{item.id}</td>
          <td>{item.call_time} us</td>
          <td>{item.pid}</td>
          <td style={{maxWidth:"500px"}}>
            <div className="code-longbox"
                 style={{margin:0}}>
              {item.args}
            </div>
          </td>
          <td style={{maxWidth:"500px"}}>
            <div className="code-longbox"
                 style={{margin:0}}>
              {item.res}
            </div>
          </td>
        </tr>);
    }

    var table = "";
    if(items.length > 0 ) {
      table =
      <table className="table table-striped">
        <thead>
          <th></th>
          <th>Id</th>
          <th>Call time</th>
          <th>Pid</th>
          <th>Args</th>
          <th>Response</th>
        </thead>
        <tbody>
          {items}
        </tbody>
      </table>;
    }

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
                <input ref="thresholdInput" type="text" className="form-control"
                       id="tresholdInput" placeholder="100"/>
                <div className="input-group-addon">ms</div>
              </div>
            </div>
            <span>   </span>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-addon">Limit</div>
                <input ref="limitInput" type="text" className="form-control"
                       id="limitInput" placeholder="2"/>
                <div className="input-group-addon">calls</div>
              </div>
            </div>
            <span>   </span>

            <button type="submit" onClick={this.handleClick.bind(this)}
                    className="btn btn-primary">Catch</button>
          </form>
        </div>
        {table}
      </div>)
  }
}
