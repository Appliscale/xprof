import PropTypes from 'prop-types';
import React from 'react';
import 'c3/c3.css';
import Grid from '../Grid';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  monitoredID: PropTypes.string.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any).isRequired,
};

const GridGraph = ({
  dps,
  monitoredID,
  setSize,
  size,
}) => {
  const wrapperID = `graphWrapper-${monitoredID}`;
  const wrapper = document.getElementById(wrapperID);
  return (
    <div
      id={wrapperID}
      style={{
        textAlign: 'center',
        justifyContent: 'center',
      }}
    >
      {wrapper && monitoredID && <Grid
        data={dps}
        setSize={setSize}
        size={size}
        graphID={monitoredID}
      />}
    </div>
  );
};

GridGraph.propTypes = propTypes;

export default GridGraph;
