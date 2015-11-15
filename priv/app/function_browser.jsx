import React from 'react';
import 'underscore';

class ACModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funs: [],
      position: -1
    };
  }

  displayFuns(data) {
    this.state.funs = data;
    this.state.position = -1;
    this.setState(this.state);
  }

  handleFunClick(fun, e) {
    this.props.addGraph(fun)
  }

  moveHighlight(delta) {
    var targetPosition = this.state.position + delta;

    if(targetPosition > 0 || targetPosition < this.state.funs.length){
      this.state.position = targetPosition;
      this.setState(this.state);
    }
  }

  highlightedFun() {
    var fun = null;
    var pos = this.state.position;

    if(pos != -1) {
      fun = this.state.funs[pos];
    }

    return fun;
  }

  static formatFun(fun) {
    return `${fun[0]}:${fun[1]}/${fun[2]}`
  }

  render() {
    var funs = this.state.funs;
    var rows = [];
    var highlightClass = "";

    for (let i = 0; i < funs.length && i < 100; i++) {

      if(i == this.state.position)
        highlightClass = "row-highlight";
      else
        highlightClass = "";

      rows.push(
        <tr className={highlightClass} key={funs[i]} onClick={this.handleFunClick.bind(this, funs[i])}>
          <td>{ACModal.formatFun(funs[i])}</td>
        </tr>);
    }

    if (funs.length > 0) {
      return (
        <div className="panel panel-default">
          <table className="table table-striped">
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

  matchFunSignature(input) {
    var regex = /(\w+):(\w+)\/(\d+)/;
    var res = regex.exec(input);

    if(res)
      return [res[1], res[2], parseInt(res[3])];
    else
      return null;
  }

  handleKeyDown(e) {
    var mod = null, fun = null, arity =null;
    var regex, enteredFun;

    switch(e.keyCode) {
      case 27: /* ESC */
        /* erase everything */
        this.clear();
        break;
      case 13: /* RETURN */
        /* submit funciton or try to compelete using selected fun */
        e.preventDefault();

        enteredFun = this.matchFunSignature(e.target.value);
        if(enteredFun)
          this.props.addGraph(enteredFun);
        else
          this.completeSearch();
        break;
      case 9: /* TAB */
        /* try to complete using selected suggestion*/
        e.preventDefault();
        this.completeSearch();
        break;
      case 38: /* ARROw UP */
        /* select next fun from the list */
        this.refs.acm.moveHighlight(-1);
        break;
      case 40: /* ARROW DOWN */
        /* select previous fun from the list */
        this.refs.acm.moveHighlight(1);
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

  getSearchBox() {
    return React.findDOMNode(this.refs.searchBox);
  }

  completeSearch() {
    var highlightedFun = this.refs.acm.highlightedFun();
    var funStr;

    if(highlightedFun) {
      funStr = ACModal.formatFun(highlightedFun);
      $(this.getSearchBox()).val(funStr);
      this.refs.acm.displayFuns([]);
    }
  }

  clear() {
    this.getSearchBox().value = "";
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
            <span className="input-group-addon" style={{width:"1%"}}>
              <span className="glyphicon glyphicon-search"></span></span>
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
