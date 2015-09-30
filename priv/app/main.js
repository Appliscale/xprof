import React from 'react';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import d3 from 'd3';
import c3 from 'c3/c3';
import 'flot';
import Graph from './graph.js'

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
            rows.push(<FunItem key={funs[i]} addGraph={this.props.addGraph} fun={funs[i]}/>);
        }
        if (funs.length > 0) {
            return (
                <div className="input-group input-group-lg">
                    <span style={{opacity:0}} className="input-group-addon" id="sizing-addon3">{'>'}</span>

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
            <div className="col-md-11">
                <div className="input-group input-group-lg">
                    <span className="input-group-addon" id="sizing-addon3">{'>'}</span>
                    <input ref='searchBox' type="text" className="form-control"
                           placeholder="Function" aria-describedby="sizing-addon3"
                           value={value} onChange={this.handleChange.bind(this)}/>
                </div>
                <ACModal ref='acm' addGraph={this.props.addGraph}></ACModal>
            </div>
        )
    }
}

class GraphPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {graphs: []};
    }

    addGraph(fun) {
        var newState = this.state;
        newState.graphs.push(fun);
        this.setState(newState);
    }

    removeGraph(fun) {
        var newState = this.state;
        var index = this.state.graphs.indexOf(fun);
        if (index > -1) {
            newState.graphs.splice(index, 1);
        }
        this.setState(newState);
    }

    render() {
        var graphs = this.state.graphs;

        var graphsPanels = [];
        for (var i = 0; i < graphs.length; i++) {
            graphsPanels.push(
                <div key={graphs[i]} className="row">
                    <div className="col-md-12">
                        <Graph removeGraph={this.removeGraph.bind(this)}  fun={graphs[i]}/>
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
        this.state = {}
    }

    addGraph(fun) {
        this.refs.graphPanel.addGraph(fun);
        this.refs.functionBrowser.clear();
    }

    render() {
        return (
            <div className="container-fluid">
                <nav className="navbar navbar-inverse  navbar-fixed-top">
                    <div className="container-fluid">

                        <div className="row">
                            <div className="col-md-1">&nbsp;
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-1">
                            </div>
                            <FunctionBrowser ref='functionBrowser' addGraph={this.addGraph.bind(this)}/>
                        </div>

                        <div className="row">
                            <div className="col-md-1">&nbsp;
                            </div>
                        </div>

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
