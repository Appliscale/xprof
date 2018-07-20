import PropTypes from 'prop-types';
import React from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import { AXIS, DATA, GRID, POINT, TRANSITION } from '../../../constants';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const LineGraph = ({ dps }) => (
  <div>
    <C3Chart
      data={{ ...DATA, json: dps }}
      point={POINT}
      grid={GRID}
      axis={AXIS}
      transition={TRANSITION}
    />
  </div>
);

LineGraph.propTypes = propTypes;

export default LineGraph;
