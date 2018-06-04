import PropTypes from 'prop-types';
import React from 'react';
import 'c3/c3.css';
import Grid from '../Grid';

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  associatedID: PropTypes.number.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any).isRequired,
};

const GridGraph = ({
  dps,
  associatedID,
  setSize,
  size,
}) => {
  const wrapperID = `graphWrapper-${associatedID}`;
  const wrapper = document.getElementById(wrapperID);
  return (
    <div
      id={wrapperID}
      style={{
        textAlign: 'center',
        justifyContent: 'center',
      }}
    >
      {wrapper && associatedID && <Grid
        data={dps}
        setSize={setSize}
        size={size}
        graphID={associatedID}
      />}
    </div>
  );
};

GridGraph.propTypes = propTypes;

export default GridGraph;
