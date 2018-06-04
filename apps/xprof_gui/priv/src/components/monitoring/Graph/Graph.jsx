import PropTypes from 'prop-types';
import React from 'react';
import GridGraph from '../GridGraph';
import LineGraph from '../LineGraph';
import { GRID, LINE } from '../../../constants/GraphTypes';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  type: PropTypes.string.isRequired,
  associatedID: PropTypes.number.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any).isRequired,
};

const Graph = ({
  dps,
  type,
  associatedID,
  setSize,
  size,
}) => {
  switch (type) {
    case GRID:
      return (
        <GridGraph
          dps={dps}
          associatedID={associatedID}
          setSize={setSize}
          size={size}
        />);
    case LINE:
      return <LineGraph dps={dps} />;
    default:
      return null;
  }
};

Graph.propTypes = propTypes;

export default Graph;
