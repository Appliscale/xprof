import PropTypes from 'prop-types';
import React from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import { AXIS, DATA, GRID, POINT, TRANSITION } from '../../../constants';
import Grid from './Grid/Grid';

function composeID(q) {
  const modFuncArity = q.split(':');
  const mod = modFuncArity[0];
  const func = modFuncArity[1].split('/')[0];
  const arity = modFuncArity[1].split('/')[1];
  return `${mod}${func}${arity}`;
}

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  type: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
};

const Graph = ({ dps, type, query }) => {
  const queryID = composeID(query);
  const wrapperID = `graphWrapper-${queryID}`;
  const wrapper = document.getElementById(wrapperID);
  if (type === 'grid') {
    return (
      <div
        id={wrapperID}
        style={{
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        {wrapper && <Grid
          data={{ ...DATA, json: dps }}
          outerWidth={wrapper.clientWidth}
          graphID={queryID}
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
