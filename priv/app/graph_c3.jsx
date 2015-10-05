import React from 'react';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import 'flot';

// NOT IMPLEMENTED !!!!!!

export default class C3Graph  {
  init(divid) {
    this.divid = divid;
    this.chart = c3.generate({
      bindto: this.divid,
      data: {
        columns: [
          ['data1', 30, 200, 100, 400, 150, 250],
          ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
          data2: 'y2'
        },
        types: {
          data2: 'bar' // ADD
        }
      },
      axis: {
        y: {
          label: {
            text: 'Y Label',
            position: 'outer-middle'
          }
        },
        y2: {
          show: true,
          label: {
            text: 'Y2 Label',
            position: 'outer-middle'
          }
        }
      }
    });
  }

  update(data) {

  }

  close(data) {

  }

}
