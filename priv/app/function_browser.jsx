import React from 'react';
import 'underscore';

class ACModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      funs: [],
      position: -1
    };
    this.cleared = false;
  }

  componentDidUpdate() {
    /* check if we need to scroll up because list of funs was reloaded */
    if(this.cleared) {
      var node = React.findDOMNode(this.refs.suggestionsPanel);
      if(node) {
        node.scrollTop = 0;
        this.cleared = false;
      }
    }
  }

  getFuns() {
      return this.state.funs.map(ACModal.formatFun);
  }

  displayFuns(data) {
    if(data.length == 0) {
      this.cleared = true;
    }
    this.state.funs = data;
    this.state.position = data.length == 1 ? 0 : -1;
    this.setState(this.state);
  }

  handleFunClick(fun, e) {
    var query = ACModal.formatFun(fun);
    this.props.addGraph(query);
  }

  moveHighlight(delta) {
    var targetPosition = this.state.position + delta;

    if(targetPosition > 0 || targetPosition < this.state.funs.length){
      this.state.position = targetPosition;
      this.setState(this.state);
    }
  }

  /* highlightedFun(): string | null; */
  highlightedFun() {
    var fun = null;
    var pos = this.state.position;

    if(pos != -1) {
      fun = ACModal.formatFun(this.state.funs[pos]);
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
    var width, height;

    for (let i = 0; i < funs.length && i < 100; i++) {

      if(i == this.state.position)
        highlightClass = "row-highlight";
      else
        highlightClass = "";

      rows.push(
        <tr className={highlightClass} key={funs[i]}
            onClick={this.handleFunClick.bind(this, funs[i])}>
          <td>{ACModal.formatFun(funs[i])}</td>
        </tr>);
    }

    width = $("#searchBox").css("width");
    height = $("#searchBox").css("height");

    if (funs.length > 0) {
      return (
        <div ref="suggestionsPanel" className="panel panel-default suggestions-panel"
             style={{top:height,width:width}}>
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

  checkInput(input) {
    /* for now this is mostly just a placeholder to check function browser input
       whether it is suitable to add a graph */
    if(input)
      return input;
    else
      return null;
  }

  handleKeyDown(e) {
    var mod = null, fun = null, arity =null;
    var enteredQuery;

    switch(e.keyCode) {
      case 27: /* ESC */
        /* erase everything */
        this.clear();
        break;
      case 13: /* RETURN */
        /* submit function or try to complete using selected fun */
        e.preventDefault();

        enteredQuery = this.checkInput(e.target.value);
        if(enteredQuery)
          this.props.addGraph(enteredQuery);
        else
          this.completeSearch();
        break;
      case 9: /* TAB */
        /* try to complete using selected suggestion*/
        e.preventDefault();
        this.completeSearch();
        break;
      case 38: /* ARROW UP */
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

    if(highlightedFun) {
      $(this.getSearchBox()).val(highlightedFun);
      this.refs.acm.displayFuns([]);
    } else {
      var suggestedFuns = this.refs.acm.getFuns();
      if(suggestedFuns.length > 0) {
        var prefix = this.commonArrayPrefix(suggestedFuns);
        $(this.getSearchBox()).val(prefix);
      }
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

  commonArrayPrefix(sortedArray) {
      var string1 = sortedArray[0];
      var string2 = sortedArray[sortedArray.length - 1];
      return this.commonPrefix(string1, string2);
  }

  commonPrefix(string1, string2) {
      var len = string1.length;
      var i = 0;

      while(i < len && string1.charAt(i) === string2.charAt(i)) i++;
      return string1.substring(0, i);
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
              <input id="searchBox" ref='searchBox' type="text" className="form-control"
                     placeholder="Function" aria-describedby="sizing-addon3"
                     value={value} onKeyDown={this.handleKeyDown.bind(this)}
                     onChange={this.handleChange.bind(this)} autofocus="autofocus"/>
              <ACModal ref='acm' addGraph={this.props.addGraph}></ACModal>
          </div>
        </div>
      </form>
    )
  }
}
