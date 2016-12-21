import React from 'react';
import 'jquery';

import 'Flot';
import "Flot/jquery.flot.fillbetween.js";
import "Flot/jquery.flot.time.js";
import "flot.tooltip/js/jquery.flot.tooltip.js"

export default class FlotGraph  {
  init(divid) {
    this.lines = [
      {label: "count", id: "count", data: [], lines: { show: false }, color: 3, yaxis:2},
      {label: "max", id: "max", data: [], color: "#8c2a04",  lines: {show: true, lineWidth: 1.0}, yaxis: 1},
      {label: "99th perc", id: "p99", data: [], color: "#e24806", lines: {show: false, lineWidth: 1.0}, yaxis: 1},
      {label: "90th perc", id: "p90", data: [], color: "#e24806", lines: {show: true, lineWidth: 1.0}, yaxis: 1},
      {label: "75th perc", id: "p75", data: [], color: "#e26606", lines: {show: true, lineWidth: 1.0}, yaxis: 1},
      {label: "50th perc", id: "p50", data: [], color: "#e26606", lines: {show: false, lineWidth: 1.0}, yaxis: 1},
      {label: "mean", id: "mean", data: [], color: "#ffaa00", lines: {show: true, lineWidth: 3.0}, yaxis: 1},
      {label: "min", id: "min", data: [], color: "#d3d004", lines: {show: true, lineWidth: 1.0}, yaxis: 1},
    ];
    //backup color
    this.lines.map((x) => x.original_color = x.color);
    this.divid = divid;
    this.plot = $.plot(this.divid, [ this.createDataSet([]) ], {
      series: {
        shadowSize: 0,   // Drawing is faster without shadows
      },
      legend: {
        position: "se",
        labelFormatter: this.labelFormatter.bind(this),
        noColumns: 10
      },
      grid: { hoverable: true},
      tooltip: {
        show: true,
        lines: true,
        content: "%s: %y"
      },
      yaxes:[
        {
          min: 0,
          tickFormatter: function (v) {
            return Math.round(v/10.0)/100.0 + " ms";
          },
          position: "left",
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

  labelFormatter(label, series) {
    return "<span class='legend-label' id='" + series.id + this.divid.substr(1) +"'>"
      + label + "</span>";
  }

  resize(){
    this.plot.resize();
    this.plot.setupGrid();
    this.plot.draw();
    this.hookLegendClickCallbacks();
  }

  update(data) {
    this.plot.setData(this.createDataSet(data));
    this.plot.setupGrid();
    this.plot.draw();
    this.hookLegendClickCallbacks();
  }

  close(data) {
  }

  togglePlot(id) {
    let line = this.lines.find(x => x.label == id).lines;
    line.show = !line.show;
  }

  hookLegendClickCallbacks() {
    this.lines.forEach((el) => {
      let selector = "#" + el.id + this.divid.substr(1);
      $(selector).click(() => this.togglePlot(el.label));
    });
  }

  createDataSet(data) {
    let result = this.lines.map((el) => {
      let datapoints = [];
      for(let item of data) {
        datapoints.push([item.time*1000, item[el.id]]);
      }
      el.data = datapoints;
      if (el.lines.show) {
        el.color = el.original_color;
      } else {
        el.color = "#aaaaaa";
      }

      return el;
    });

    return result;
  }
}
