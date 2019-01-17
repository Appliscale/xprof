import * as d3 from 'd3';
import {
  gridData,
  dataTransform,
  label,
  renderTimeLabels,
  getPositionY,
  getPositionX,
  calcFont,
  getData,
  getAttr,
  passCursorCoords,
  trackCursor,
  initTooltip,
  composeID,
  generateRectangles,
  generateRows,
  generateXAxis,
  generateYAxis,
} from './gridUtils';

export function compose(props) {
  const { data, graphID, size } = props;
  const dataArray = dataTransform(data);

  const {
    times,
    names,
    dataGrid,
  } = dataArray;

  const r = names.length;
  const c = times.length;
  const w = size.width / c;
  const h = size.height / r;
  const gData = gridData(r, c, w, h, names);

  // Select Tooltip
  const tooltip = d3.select('#tip');

  // Append chart
  const grid = d3.select(`#grid-${graphID}`)
    .append('svg')
    .attr('id', `gridTable-${graphID}`)
    .attr('width', size.width)
    .attr('height', size.height)
    /*
      The following line prevents the tooltip from being displayed
      on user very rapidly moving the cursor outside the grid
      - although the moving cursor outside the color-rectangle event
      should do the trick, it sometimes does not.
      We are double securing ourselves.
    */
    .on('mouseout', () => tooltip.style('visibility', 'hidden'));

  // creating the abstract rows representation
  const rows = generateRows(grid, gData, graphID);

  // filling it with color-rectangles
  generateRectangles(rows, graphID, dataGrid, tooltip);

  // Append x axis
  generateXAxis(graphID, size, c, w, times);

  // Append y axis
  generateYAxis(graphID, size, r, h, tooltip, gData, names);
}

export function update(props) {
  const tooltip = d3.select('#tip');

  // Getting the new data and new size
  const { data, graphID, size } = props;
  const {
    times,
    names,
    dataGrid,
  } = dataTransform(data);

  // Creating the new grid - we will be moving and resizing the rectangles
  const newR = names.length;
  const newC = times.length;
  const newW = size.width / newC;
  const newH = size.height / newR;
  const updatedGrid = gridData(newR, newC, newW, newH);

  dataGrid.forEach((_, i) => {
    const id = composeID(dataGrid[i].row, dataGrid[i].column);
    const get = {
      x: getData(id, updatedGrid, 'x'),
      y: getData(id, updatedGrid, 'y'),
      height: getData(id, updatedGrid, 'height'),
      width: getData(id, updatedGrid, 'width'),
      time: getAttr(id, dataGrid, 'time'),
      value: getAttr(id, dataGrid, getAttr(id, dataGrid, 'bucket')),
      bucket: getAttr(id, dataGrid, 'bucket'),
      fill: (getAttr(id, dataGrid, 'color') || '#f5f5f5'),
    };

    d3.select(`[id='${id}-${graphID}']`)
      .attr('x', get.x)
      .attr('y', get.y)
      .attr('height', get.height)
      .attr('width', get.width)
      .attr('time', get.time)
      .attr('value', get.value)
      .attr('bucket', get.bucket)
      .style('fill', get.fill);
  });

  // Now resizing the whole grid container
  d3.select(`#gridTable-${graphID}`)
    .attr('width', size.width)
    .attr('height', size.height);

  // Finally updating the axes
  d3.select(`#xAxis-${graphID}`)
    .attr('width', size.width + 20)
    .attr('height', size.marginBottom);

  const updateX = gridData(1, newC, newW, size.marginBottom);

  d3.selectAll(`.xRow-${graphID}`)
    .attr('width', size.marginBottom);

  d3.selectAll(`.xLabelSquare-${graphID}`)
    .attr('x', d => getData(d.id, updateX, 'x'))
    .attr('y', d => getData(d.id, updateX, 'y'))
    .attr('height', d => getData(d.id, updateX, 'height') / 8)
    .attr('width', d => getData(d.id, updateX, 'width'));

  updateX[0].forEach((u, i) => {
    d3.select(`#xl${i}-${graphID}`)
      .attr('x', getPositionX(u, i, times))
      .attr('y', getPositionY(u, i, times))
      .style('font', () => calcFont('x'))
      .text(renderTimeLabels(u, i, times));
  });

  // Append y axis
  d3.select(`#yAxis-${graphID}`)
    .attr('width', size.marginLeft)
    .attr('height', size.height);

  const updateY = gridData(newR, 1, size.marginLeft, newH);

  d3.selectAll(`.yCol-${graphID}`)
    .attr('width', size.marginLeft);

  d3.selectAll(`.yLabelSquare-${graphID}`)
    .attr('x', d => getData(d.id, updateY, 'x'))
    .attr('y', d => getData(d.id, updateY, 'y'))
    .attr('height', d => getData(d.id, updateY, 'height'))
    .attr('width', d => getData(d.id, updateY, 'width'));

  d3.selectAll(`.yLabel-${graphID}`)
    .attr('x', d => getData(d.id, updateY, 'x') + 4)
    // eslint-disable-next-line
    .attr('y', d => getData(d.id, updateY, 'y') + (0.7 * getData(d.id, updateY, 'height')))
    .style('font', () => calcFont('y'))
    .text(d => names[label('y', d.id)]);

  /*
    We have to constantly track cursor because the graph is moving;
    if we would have a still cursor over place
    where the rectangles are passing, the 'mouseover' would be fired according
    to the mouse (and tooltip would flash only once, as there is
    no mouse event for a still cursor);
    in the end we have the mouse coordinates stored and check
    for hovered rect (which stores the information about its data) -
    those are the two pieces of information we need to construct the tooltip.
  */

  const hoveredRect = document.querySelector('.r:hover');
  trackCursor(passCursorCoords);
  initTooltip(hoveredRect, tooltip);
}
