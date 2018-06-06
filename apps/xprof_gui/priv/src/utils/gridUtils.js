import _ from 'lodash';
import * as d3 from 'd3';

export const composeID = (row, column) => `${row}:${column}`;

/*
  Creates the desired rectangle grid data,
  ready to be transformed into SVG representation.
*/
export function gridData(rows, columns, width, height, names = false) {
  const data = [];
  let xpos = 1;
  let ypos = 1;

  for (let row = 0; row < rows; row += 1) {
    data.push([]);
    for (let column = 0; column < columns; column += 1) {
      data[row].push({
        x: xpos,
        y: ypos,
        width,
        height,
        id: `${row}:${column}`,
        rowName: names ? names[row] : '',
      });
      xpos += width;
    }
    xpos = 1;
    ypos += height;
  }
  return data;
}

export const transpose = arr => _.zip(...arr);

export function hide(hidePattern, rowName) {
  if (hidePattern) {
    hidePattern.forEach((p) => {
      if (p === rowName) {
        return 'none';
      }
      return 'inline';
    });
  }
}

export function hideRows(hidePattern, allRows) {
  if (hidePattern) {
    allRows.forEach((row) => {
      hidePattern.forEach((p) => {
        if (p === row) {
          d3.select(`.${row}-row`)
            .style('display', 'none');
          d3.select(`.${row}-yCol`)
            .style('display', 'none');
        }
        return null;
      });
    });
  }
}

/* function checkEmpty(dps) {
  const emptyRows = [];
  const e = [];
  let k = null;
  let c = null;
  // console.log('dps:', dps);
  dps.forEach((d) => {
    Object.keys(d).forEach((key) => {
      // console.log(`Going inside ${key}...`);
      const strKey = String(key);
      const column = Object.values(dps).map(v => v[strKey]);
      // console.log(`${key}-column:`, column);
      k = key;
      c = column;
    //  if (column.every(c => c === 0)) {
    //    emptyRows.push(key);
    //  }
    });
    e.push({ [k]: c });
  });
  console.log('e:', e);
  return _.uniq(emptyRows).filter(r => r !== 'time');
} */

/* export function filteredDPS(dps) {
  // const sentenced = checkEmpty(dps);
  // const filtered = [];
  // dps.forEach(d => filtered.push(_.omit(d, sentenced)));
  return dps.map(d => _.omit(d, checkEmpty(dps)));
} */

export const filteredDPS = (dps, omited) => dps.map(d => _.omit(d, omited));

export function dataTransform(dataInput) {
  const dataLocation = [];
  const allValues = [];
  const timeArray = [];
  const allNames = [];

  /*
    The input data produced by Erlang should be an array of objects.
    The one of the key-value pairs should have a time moment stored.
    E.g.:

    data = {
      0: {
        bucket1: value1inTime0,
        bucket2: value2inTime0,
        bucket3: value3inTime0,
        bucket4: value4inTime0,
        time: time0
      },
      1 : {
        bucket1: value1inTime1,
        bucket2: value2inTime1,
        bucket3: value3inTime1,
        bucket4: value4inTime1,
        time: time1
      },
      .
      .
      .
      N : {
        ...
        bucket_M: value_M_in_Time_N
        ...
        time: time_N
      }
    }
  */
  Object.entries(dataInput).forEach((e, i) => {
    const valuesRow = [];
    let row = {};
    let time = 0;

    Object.entries(e[1]).forEach((f) => {
      if (f[0] === 'time') {
        time = f;
        timeArray.push(f[1]);
      } else {
        valuesRow.push(f);
        allValues.push(f[1]);
      }
    });

    valuesRow.forEach((a, j) => {
      row = {
        row: j,
        column: i,
        time: time[1],
        [a[0]]: a[1], // bucket-name: value
        bucket: a[0], // bucket: bucket-name
      };

      dataLocation.push(row);
      allNames.push(a[0]);
    });
  });

  const dataDomain = _.uniq(allValues).sort((a, b) => a - b);

  const colorRange = [
    '#ffffcc',
    '#ffeda0',
    '#fed976',
    '#feb24c',
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026',
  ];

  const colorScale = d3.scaleQuantile()
    .domain(dataDomain)
    .range(colorRange);

  const dataGrid = dataLocation.map((u) => {
    const { bucket } = u;
    // Adding the color field to the exisiting object.
    return Object.assign(u, { color: colorScale(u[bucket]) });
  });
  const times = timeArray;
  const names = _.uniq(allNames);

  return {
    dataGrid, times, names,
  };
  // dataGrid - the in-grid location of the data and the color.
  // times - the unique list of sorted time values.
  // names - the unique list of bucket names.
}

export function getAttr(id, arr, name) {
  const dID = id.split(':'); // the dID holds the in-grid location
  const dataRow = parseInt(dID[0], 10); // is representing the bucket
  const dataCol = parseInt(dID[1], 10); // is representing the time moment
  let attrValue = null;
  arr.forEach((dg) => {
    if (dg.column === dataCol && dg.row === dataRow) {
      attrValue = dg[name];
    }
  });
  return attrValue;
}

export function trackSnapshots(nowRow, recent) {
  const pattern = _.omit(nowRow, 'time');
  const thatTime = nowRow.time;
  const recentCopy = recent;
  Object.entries(pattern).forEach((el) => {
    if (el[1] === recent[el[0]]) {
      recentCopy[el[0]] = recent[el[0]];
    } else if (el[1] !== 0) {
      recentCopy[el[0]] = thatTime;
    }
  });
  return _.mapValues(recentCopy, r => r !== undefined && r);
}

export function goneRows(snapshot, time) {
  return Object.entries(snapshot).filter(s => s[1] < time).map(k => k[0]);
}

export function label(direction, id) {
  const splitID = id.split(':');
  /*
    Upon informing the function about what axis we are talking about,
    it is returning the label index.
  */
  if (direction === 'x') {
    return splitID[1];
  } else if (direction === 'y') {
    return splitID[0];
  }
  return '';
}

export function spaceLabels(id, len, j, zero) {
  /*
    This function deals only with the x-axis.
    It:
    1.  Thinks about all the possible labels.
    2.  Gets the desired number of labels.
    3.  Figures out how the desired number of labels
        should be evenly spaced in the whole labels chain
        (e.g. how evenly space the 10 labels in a 120 labels chain).

    Its purpose is to store that information
    and upon receiving the label to be rendered,
    deciding whether it is the desired label or not.
  */
  const splitID = parseInt(id.split(':')[1], 10);
  const p = Math.ceil(len / j);
  const ticks = [];

  for (let i = zero; i < len; i += p) {
    ticks.push(i);
  }

  if (ticks.includes(splitID)) {
    return true;
  }

  return false;
}

export function colorTick(condition) {
  if (condition) {
    return 'darkgrey';
  }
  return '#f5f5f5';
}

function printTick(l, condition) {
  if (condition) {
    return l;
  }
  return '';
}

export function renderTimeLabels(d, i, time) {
  if (window.innerWidth < 690) {
    /*
      When the screen is very narrow,
      we don't want the labels to be resized because they are already very long.
      What we do is we're splitting the labels:
        - the hour is at the begining of the axis,
        - the minutes and the seconds are under their label bars.
      This alows us to render slightly bigger labels.
      The axis spans for 120 units which is 120 seconds.
      There could be a situation where we are experiencing
      the "changing of the time guards".
      Then the first-bar-hour-label is expressed as the:

      H1
      H2

      where:
        H1 is the passing hour,
        H2 is the incoming hour.

      Then the axis could look like this:

      |III|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIII ...
      10  :59:45  :59:57  :00:09  :00:21  :00:33  :00:45  :00:57  :01:09 ...
      11

      Whereas after a while it would look like this:

      |III|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIIIII|IIIII ...
      11  :00:09  :00:21  :00:33  :00:45  :00:57  :01:09  :00:21  :00:33 ...

      And so on.
      This function cares only about rendering. The label-atop-another
      construction is done purely by the positioning functions.
    */
    const hourFormat = d3.timeFormat('%H');
    const restFormat = d3.timeFormat(':%M:%S');
    const current = hourFormat(time[0]);
    const incoming = hourFormat(time[time.length - 1]);
    if (i === 0) {
      return current;
    }
    if (current !== incoming) {
      if (i === time.length - 1) {
        return incoming;
      }
    }
    return printTick(
      restFormat(time[label('x', d.id)]),
      spaceLabels(d.id, time.length, 10, 5),
    );
  }
  const wholeFormat = d3.timeFormat('%H:%M:%S');
  return printTick(
    wholeFormat(time[label('x', d.id)]),
    spaceLabels(d.id, time.length, 10, 5),
  );
}

export function getPositionY(d, i, time) {
  /*
    Every label is postioned under its axis-bar except of the last one.
    The last label in a chain is placed exactly under the first one.
    When there will be an hour change within the axis, this strangely positioned
    label will be made visible. We do not have to check if there is
    an hour change, the last label is always there, ready to be displayed.
  */
  const position = d.y + (d.height / 3);
  if (i === time.length - 1) {
    /*
      The following commented out part was generating crashes
      as the wanted label to check size was sometimes not yet rendered.
      Now the value is hard-read from the Inspector and inserted.
    */

    /* if (document.getElementsByClassName(`xLabel-${graphID}`)) {
      const l = Array
        .from(document.getElementsByClassName(`xLabel-${graphID}`))[0];
      const h = parseFloat(getComputedStyle(l).fontSize);
      return position + h;
    } */
    return position + 9;
  }
  return position;
}

export function getPositionX(d, i, time) {
  if (i === time.length - 1) {
    return time[0].x;
  }
  return d.x;
}

export function getData(id, data, d) {
  const dID = id.split(':'); // the dID holds the in-grid location
  const dataRow = parseInt(dID[0], 10); // is representing the bucket
  const dataCol = parseInt(dID[1], 10); // is representing the time moment
  const row = data[dataRow];
  if (row) {
    return row[dataCol][d];
  }
  return null;
}

function getCoordsFromAttr() {
  const xy = document.querySelector('#tip')
    .getAttribute('coords')
    .split(',');

  return [
    parseInt(xy[0], 10),
    parseInt(xy[1], 10),
  ];
}

export function passCursorCoords(e) {
  d3.select('#tip')
    .attr('coords', `${e.pageX},${e.pageY}`);
  /*
    We have to pass it that way - every d3.attr ends as string
    so we'll be getting the numbers in getCoordsFromAttr();
    we are passing it to the ever-present tooltip attr because
    it cannot be easily stored in the state as the passCursorCoords()
    will inherit the context from the trackCursor() which evalutes
    to the 'document' (thus the this.setState() is hard to invoke).
  */
}

export function trackCursor(func) {
  if (window.Event) {
    document.captureEvents(Event.MOUSEMOVE);
  }
  document.onmousemove = func;
}

function collectData(el) {
  return [
    el.getAttribute('time'),
    el.getAttribute('bucket'),
    el.getAttribute('value'),
  ];
}

function tooltipElements(data) {
  const baseStyle = 'border: 1px solid darkgrey; padding: 4px';
  const labelStyle = `style="${baseStyle}"`;
  const dataStyle = `style="${baseStyle}; text-align: center"`;
  const nullData = data.every(d => d === null);
  if (!nullData) {
    // eslint-disable-next-line
    return `<table><tbody><tr><td ${labelStyle}><strong>Time</strong></td><td ${dataStyle}>${d3.timeFormat('%H:%M:%S')(data[0])}</td></tr><tr><td ${labelStyle}><strong>${data[1]}</strong></td><td ${dataStyle}>${data[2]}</td></tr></tbody></table>`;
  }
  // eslint-disable-next-line
  return `<table><tbody><tr><td ${labelStyle}><strong>No data</strong></td></tr></tbody></table>`;
/*
  It expands into this:
  .html(`<table>
              <tbody>
                <tr>
                  <td ${labelStyle}>
                    <strong>
                      Time
                    </strong>
                  </td>
                  <td ${dataStyle}>
                    ${d3.timeFormat('%H:%M:%S')(data[0])}
                  </td>
                </tr>
                <tr>
                  <td ${labelStyle}>
                    <strong>
                      ${data[1]}
                    </strong>
                  </td>
                  <td ${dataStyle}>
                    ${data[2]}
                  </td>
                </tr>
              <tbody/>
            </table>`);

  And this:
            <table>
              <tbody>
                <tr>
                  <td ${labelStyle}>
                    <strong>No data</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            */
}

const flip = (x) => {
  /*
    When the browser window is very small and we are near the window contour,
    we have to flip the tooltip, otherwise it will flow outside the window
  */
  if (x > 0.7 * window.innerWidth) {
    return -100;
  }
  return 10;
};

export function renderTooltipFromRect(tooltip, id, graphID) {
  const element = document.querySelector(`[id='${id}-${graphID}']`);
  const data = element && collectData(element);
  const flipSide = flip(d3.event.pageX);
  return tooltip
    .style('visibility', 'visible')
    .style('top', `${d3.event.pageY + 10}px`)
    .style('left', `${d3.event.pageX + flipSide}px`)
    .html(tooltipElements(data));
}

function renderTooltip(tooltipSelection, coords, data) {
  const flipSide = flip(coords[0]);
  tooltipSelection
    .style('top', `${coords[1] + 10}px`)
    .style('left', `${coords[0] + flipSide}px`)
    .style('visibility', 'visible')
    // eslint-disable-next-line
    .html(tooltipElements(data));
}

export function prepareTooltip() {
  if (!document.getElementById('tip')) {
    d3.select('#root').append('div')
      .attr('id', 'tip')
      .attr('coords', '')
      .style('position', 'absolute')
      .style('padding', '2px')
      .style('font', '0.75em sans-serif')
      .style('background', '#f5f5f5')
      .style('border', '20px')
      .style('border-radius', '2px')
      .style('pointer-events', 'none')
      .style('visibility', 'visible')
      .style('opacity', 0.9)
      .style('z-index', 99);
  }
}

export function initTooltip(rect, tooltip) {
  if (rect) {
    renderTooltip(
      tooltip,
      getCoordsFromAttr(),
      collectData(rect),
    );
  }
}

export function calcFont(axis) {
  const w = window.innerWidth;
  let fontSize = 0;
  if (axis === 'y') {
    switch (true) {
      case (w < 560):
        fontSize = 0.5;
        break;
      case (w < 660):
        fontSize = 0.55;
        break;
      case (w < 1030):
        fontSize = 0.8;
        break;
      case (w < 1110):
        fontSize = 0.6;
        break;
      case (w < 1250):
        fontSize = 0.7;
        break;
      case (w < 1450):
        fontSize = 0.8;
        break;
      case (w < 1600):
        fontSize = 0.89;
        break;
      default:
        fontSize = 1;
        break;
    }
  } else {
    switch (true) {
      case (w < 600):
        fontSize = 0.6;
        break;
      case (w < 770):
        fontSize = 0.7;
        break;
      case (w < 1180):
        fontSize = 0.7;
        break;
      case (w < 1600):
        fontSize = 0.89;
        break;
      default:
        fontSize = 1;
        break;
    }
  }

  return `${fontSize}em sans-serif`;
}

const getWrapperWidth = (id) => {
  const element = document.getElementById(`graphWrapper-${id}`);
  return element ? element.clientWidth : 0;
};

export const updateSize = (func, id) => func(getWrapperWidth(id));

export const executeIfExists = (element, func, args) => element && func(args);
