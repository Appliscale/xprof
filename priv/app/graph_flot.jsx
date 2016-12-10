import React from 'react';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import 'Flot';
import "Flot/jquery.flot.fillbetween.js";
import "Flot/jquery.flot.time.js";

export default class FlotGraph  {
  init(divid) {
    this.divid = divid;
    this.plot = $.plot(this.divid, [ this.createDataSet([]) ], {
      series: {
        shadowSize: 0   // Drawing is faster without shadows
      },
      yaxes:[
        {
          min: 0,
          tickFormatter: function (v) {
            return Math.round(v/10.0)/100.0 + " ms";
          },
          position: "left"
        },
        {
          min: 0,
          position: "right"
        },
      ],
      xaxis: {
        mode: "time",
        show: true,
      }
    });
  }

  resize(){
    this.plot.resize();
    this.plot.setupGrid();
    this.plot.draw();
  }

  update(data) {
    this.plot.setData(this.createDataSet(data));
    this.plot.setupGrid();
    this.plot.draw();
  }

  close(data) {
  }

  createDataSet(data) {
    var flotdata ={mean: [], max: [], min: []};

    for(let v of ["mean", "min", "max", "p25", "p50", "p75", "p90", "p99", "count"]){
      flotdata[v] = [];

      for(let item of data) flotdata[v].push([item.time*1000, item[v]]);
    }

    return [
      { label: "mean", data: flotdata["mean"], lines: { show: true }, color: "rgb(50,50,255)", yaxis:1  },
      { label: "count", data: flotdata["count"], lines: { show: true }, color: "rgb(50,255,0)", yaxis:2 },
      { label: "min", id: "min", data: flotdata["min"], lines: { show: true, lineWidth: 0.5, fill:0 }, color: "rgb(255,50,50)",  yaxis:1},
      { id: "p25", data: flotdata["p25"], lines: { show: true, lineWidth: 0, fill:0.2 }, color: "rgb(255,50,50)",  fillBetween: "min", yaxis:1 },
      { id: "p50", data: flotdata["p50"], lines: { show: true, lineWidth: 0.5, fill:0.4, shadowSize:0 }, color: "rgb(255,50,50)",  fillBetween: "p25", yaxis:1 },
      { id: "p75", data: flotdata["p75"], lines: { show: true, lineWidth: 0, fill:0.4}, color: "rgb(255,50,50)",  fillBetween: "p50", yaxis:1 },
      { id: "p90", data: flotdata["p90"], lines: { show: true, lineWidth: 0, fill:0.2 }, color: "rgb(255,50,50)",  fillBetween: "p75", yaxis:1 },
      { id: "p99", data: flotdata["p99"], lines: { show: true, lineWidth: 0.4, fill:0.15 }, color: "rgb(255,50,50)", fillBetween: "p90", yaxis:1 },
      { label: "max", id: "max", data: flotdata["max"], lines: { show: true, lineWidth: 0.5, fill: 0.1 }, color: "rgb(255,50,50)", fillBetween: "p99", yaxis:1 }];

  }

}
