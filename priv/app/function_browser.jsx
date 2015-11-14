import React from 'react';
import 'underscore';

class ACModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {funs: []};
  }

  displayFuns(data) {
    this.setState({funs: data});
  }

  handleFunClick(fun, e) {
    this.props.addGraph(fun)
  }

  render() {
    var funs = this.state.funs;
    var rows = [];

    for (let i = 0; i < funs.length && i < 100; i++) {
      rows.push(
        <tr key={funs[i]} onClick={this.handleFunClick.bind(this, funs[i])}>
          <td>{funs[i][0]}:{funs[i][1]}/{funs[i][2]}</td>
        </tr>);
    }

    if (funs.length > 0) {
      return (
        <div className="panel panel-default">
          <table className="table table-hover table-striped">
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>)
    } else
    return (<div></div>);
  }
}

export default class FunctionBrowser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ""};
  }

  handleKeyDown(e) {
    console.log("keyCode", e.keyCode);

    var mod = null, fun = null, arity =null;

    /* scan input for function signature */
    var regex = /(\w+):(\w+)\/(\d+)/;
    var res = regex.exec(e.target.value);
    if(res) {
      mod = res[1];
      fun = res[2];
      arity = res[3];
      console.log(e.type);
    }

    switch(e.keyCode) {
      case 27:
        this.clear();
        break;
      case 13:
        e.preventDefault();
        if(mod != null) {
          this.props.addGraph([mod,fun,parseInt(arity)]);
        }
        break;
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
    var searchBoxDOM = React.findDOMNode(this.refs.searchBox);
    searchBoxDOM.value = "";
    this.refs.acm.displayFuns([]);
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
          <div className="input-group" style={{display:"table"}}>
            <span className="input-group-addon" style={{width:"1%"}}><span className="glyphicon glyphicon-search"></span></span>
            <input ref='searchBox' type="text" className="form-control"
                   placeholder="Function" aria-describedby="sizing-addon3"
                   value={value} onKeyDown={this.handleKeyDown.bind(this)}
                   onChange={this.handleChange.bind(this)} autofocus="autofocus"/>

          </div>
        </div>
        <ACModal ref='acm' addGraph={this.props.addGraph}></ACModal>
      </form>

    )
  }
}
