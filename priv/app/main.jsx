import React from 'react';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import d3 from 'd3';
import c3 from 'c3/c3';
import 'flot';
import Graph from './graph.jsx'

class FunItem extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(event) {
    this.props.addGraph(this.props.fun)
  }

  render() {
    var fun = this.props.fun;
    return <a href='#' onClick={this.handleClick.bind(this)}
                   className='list-group-item'>{fun[0]}:{fun[1]}/{fun[2]}</a>
  }
}

class ACModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {funs: []};
  }

  displayFuns(data) {
    this.setState({funs: data});
  }

  render() {
    var funs = this.state.funs;
    var rows = [];

    for (let i = 0; i < funs.length && i < 100; i++) {
      rows.push(<FunItem key={funs[i]} addGraph={this.props.addGraph}
                        fun={funs[i]}/>);
    }

    if (funs.length > 0) {
      return (
        <div className="input-group input-group-lg">
          <span style={{opacity:0}} className="input-group-addon"
                  id="sizing-addon3">{'>'}</span>
          <div className="panel panel-default">
            <div className="panel-body">
              <div className="list-group">
                {rows}
              </div>
            </div>
          </div>
        </div>)
    } else
    return (<div></div>);
  }
}

class FunctionBrowser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ""};
  }

  handleKeyDown(e) {
    var regex = /(\w+):(\w+)\/(\d+)/;
    var res = regex.exec(e.target.value);
    var mod = null, fun = null, arity =null;

    if(res) {
      mod = res[1];
      fun = res[2];
      arity = res[3];
      console.log(e.type);
    }
    if(e.keyCode == 13 && mod != null) {
      this.props.addGraph([mod,fun,parseInt(arity)]);
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    if (event.target.value != "") {
      $.getJSON("/api/funs", {query: event.target.value},
        this.funsSuccess.bind(this));
    }
    else {
      this.refs.acm.displayFuns([]);
    }
  }

  clear() {
    this.refs.acm.displayFuns([]);
    $(React.findDOMNode(this.refs.searchBox)).val("");
  }

  funsSuccess(data) {
    if (this.state.value != "")
      this.refs.acm.displayFuns(data);
  }

  render() {
    var autocomp = null;
    var value = this.state.value;

    return (
      <form className="navbar-form">
        <div className="form-group" style={{display:"inline"}}>
          <div className="input-group">
            <span className="input-group-addon" id="sizing-addon3">{'>'}</span>
            <input ref='searchBox' type="text" className="form-control"
                    placeholder="Function" aria-describedby="sizing-addon3"
                    value={value} onKeyDown={this.handleKeyDown.bind(this)}
                    onChange={this.handleChange.bind(this)}/>
          </div>

          <ACModal ref='acm' addGraph={this.props.addGraph}></ACModal>
        </div>
      </form>
    )
  }
}

class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {funs: []};
  }

  componentDidMount() {
    this.funsInterval = window.setTimeout(this.getFunsList.bind(this), 500);
  }

  componentWillUnmount() {
    window.clearTimeout(this.interval);
  }


  // Getting data

  startMonitoring(fun) {
    $.ajax({
      url: "/api/mon_start",
      data: {mod: fun[0], fun: fun[1], arity: fun[2]}
    }).done(function() { this.getFunsList()}.bind(this));

  }

  addGraph(fun) {
    this.startMonitoring(fun);
  }

  removeGraph(fun) {
    var newState = this.state;
    var index = this.state.funs.indexOf(fun);
    if (index > -1) {
      newState.funs.splice(index, 1);
    }
    this.setState(newState);
  }

  getFunsList() {
    $.ajax({
      url: "/api/mon_get_all",
      success: this.handleFuns.bind(this),
      error: this.handleFunsError.bind(this)
    });
  }

  handleFuns(data) {
    console.log("Funs", data);
    this.state.funs = data;
    this.setState(this.state);
    window.setTimeout(this.getFunsList.bind(this), 500);
  }

  handleFunsError(jqXHR, error) {
    console.log("Getting funs error", error);
    window.setTimeout(this.getFunsList.bind(this), 1000);
  }

  render() {
    var funs = this.state.funs;

    var graphsPanels = [];
    for (var i = 0; i < funs.length; i++) {
      graphsPanels.push(
        <div key={funs[i]} className="row">
          <div className="col-md-12">
            <Graph removeGraph={this.removeGraph.bind(this)}  fun={funs[i]}/>
          </div>
        </div>
      )
    }

    return (<div className="container-fluid">{graphsPanels}</div>);
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  addGraph(fun) {
    this.refs.graphPanel.addGraph(fun);
    this.refs.functionBrowser.clear();
  }

  render() {
    return (
      <div className="container-fluid">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">XProf</a>
          </div>

          <div className="navbar-collapse collapse" id="navbar-collapsible">
            <FunctionBrowser ref='functionBrowser' addGraph={this.addGraph.bind(this)}/>
          </div>
        </nav>
        <GraphPanel ref='graphPanel'/>
      </div>
    );
  }
}

React.render(
  <App/>,
  document.getElementById('main-container')
);
