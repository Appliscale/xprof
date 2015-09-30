import React from 'react';
import FlotGraph from  "./graph_flot.js"

const UPDATE_INTERVAL = 1000;
const MAX_DPS = 10 * 60; //10 minutes

export default class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.startMonitoring();
        this.state = {dps: []};
    }

    startMonitoring() {
        var fun = this.props.fun;
        $.ajax({
            url: "/api/mon_start",
            data: {mod: fun[0], fun: fun[1], arity: fun[2]}
        }).done(
            function (data) {
                var ref = setInterval(this.getData.bind(this), UPDATE_INTERVAL);
                var newState = this.state;
                newState.interval = ref;
                this.setState(newState);
            }.bind(this))
    }

    componentDidMount() {
        this.graph = new FlotGraph();
        this.graph.init("#" +this.chartId());
    }

    getData() {
        var fun = this.props.fun;
        $.ajax({
            url: "/api/data",
            data: {mod: fun[0], fun: fun[1], arity: fun[2]}
        }).done(
            function (data) {
                var state = this.state;
                state.dps.push(data);
                if(state.dps.length > MAX_DPS) {
                    var truncData = state.dps.slice(state.dps.length - MAX_DPS, state.dps.length);
                    state.dps = truncData;
                }
                this.graph.update(state.dps);
                this.setState(state);
            }.bind(this))
    }

    close() {
        var fun = this.props.fun;
        clearInterval(this.state.interval);
        $.ajax({
            url: "/api/mon_stop",
            data: {mod: fun[0], fun: fun[1], arity: fun[2]}
        }).done((
            ()=>this.props.removeGraph(fun)
        ).bind(this));
    }

    chartId() {
        return `chart_${this.props.fun[0]}_${this.props.fun[1]}_${this.props.fun[2]}`
    }

    render() {
        var fun = this.props.fun;
        var dps = this.state.dps;
        var chartId = this.chartId();

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <button onClick={this.close.bind(this)} type="button" className="close" data-dismiss="modal"
                            aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h3 className="panel-title">{fun[0]}:{fun[1]}/{fun[2]}</h3>
                </div>
                <div className="panel-body">
                    <div id={this.chartId()} className="chart">
                    </div>
                </div>
            </div>
        )
    }
}
