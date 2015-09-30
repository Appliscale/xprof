import React from 'react';
import 'underscore';
import FlotGraph from  "./graph_flot.js"

const UPDATE_INTERVAL = 1000;
const MAX_DPS = 5 * 60; //10 minutes

export default class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.startMonitoring();
        this.state = {dps: [], error: false};
    }

    componentDidMount() {
        this.graph = new FlotGraph();
        this.graph.init("#" +this.chartId());

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    render() {
        var fun = this.props.fun;
        var panelType = "panel panel-default ";
        var errorMsg = "";

        if(this.state.error) {
            panelType += "panel-danger";
            errorMsg = <strong>  -  communication error</strong>;
        }

        return (
            <div className={panelType}>
                <div className="panel-heading">
                    <button onClick={this.handleClose.bind(this)} type="button" className="close" data-dismiss="modal"
                            aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h3 className="panel-title">{fun[0]}:{fun[1]}/{fun[2]}{errorMsg}</h3>
                </div>
                <div className="panel-body">
                    <div id={this.chartId()} className="chart">
                    </div>
                </div>
            </div>
        )
    }

    // Handle actions

    handleResize(e) {
        this.graph.resize();
    }

    handleClose() {
        var fun = this.props.fun;
        clearInterval(this.state.interval);
        $.ajax({
            url: "/api/mon_stop",
            data: {mod: fun[0], fun: fun[1], arity: fun[2]}
        }).done((
            ()=>this.props.removeGraph(fun)
        ).bind(this));
    }

    // Getting data

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


    getData() {
        var fun = this.props.fun;
        $.ajax({
            url: "/api/data",
            data: {mod: fun[0], fun: fun[1], arity: fun[2]},
            success: this.handleData.bind(this),
            error: this.handleDataError.bind(this)})
    }

    handleData(data) {
        var state = this.state;
        var dps = [];
        state.dps.push(data);

        /* truncrate data if needed */
        if(state.dps.length > MAX_DPS) {
            var truncData = state.dps.slice(state.dps.length - MAX_DPS, state.dps.length);
            state.dps = truncData;
            dps = truncData;
        }
        /* pad data to maintain fixed width graph */
        else {
            dps = state.dps;
            var lastItem = _.last(state.dps);
            var lastTime = lastItem.time;
            for(var key in lastItem){
                lastItem[key] = 0;
            }

            console.log("lastTime", lastTime);
            for (let i=dps.length;i<MAX_DPS;i++){
                var item = _.clone(lastItem);
                item.time = lastTime + i;
                dps.push(item);
            }
            console.log(dps)
        }

        this.graph.update(dps);
        this.setState(state);
    }

    handleDataError(jqXHR, error) {
        console.log("error!", jqXHR.statusCode());
        this.state.error = true;
        this.setState(this.state);
    }

    // Helpers

    chartId() {
        return `chart_${this.props.fun[0]}_${this.props.fun[1]}_${this.props.fun[2]}`
    }
}
