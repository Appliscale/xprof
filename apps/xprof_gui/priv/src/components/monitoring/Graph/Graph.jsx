import PropTypes from 'prop-types';
import React from 'react';
import GridGraph from '../GridGraph';
import LineGraph from '../LineGraph';
import { GRAPH_TYPE } from '../../../constants/GraphTypes';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  type: PropTypes.string.isRequired,
  monitoredID: PropTypes.string.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any).isRequired,
};

const Graph = ({
  dps,
  type,
  monitoredID,
  setSize,
  size,
}) => {
  switch (type) {
    case GRAPH_TYPE.GRID:
      return (
        <GridGraph
          dps={dps}
          monitoredID={monitoredID}
          setSize={setSize}
          size={size}
        />);
    case GRAPH_TYPE.LINE:
      return <LineGraph dps={dps} />;
    default:
      return null;
  }
};

Graph.propTypes = propTypes;

export default Graph;
