import PropTypes from 'prop-types';
import React from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import { AXIS, DATA, GRID, POINT, TRANSITION } from '../../../constants';
import Grid from './Grid/Grid';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  type: PropTypes.string.isRequired,
};
const Graph = ({ dps, type }) => {
  const wrapper = document.getElementById('graphWrapper');
  if (type === 'grid') {
    return (
      <div
        id="graphWrapper"
        style={{
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        {wrapper && <Grid
          data={{ ...DATA, json: dps }}
          outerWidth={wrapper.clientWidth}
        />}
      </div>
    );
  }
  return (
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
};
Graph.propTypes = propTypes;

export default Graph;
