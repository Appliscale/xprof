import PropTypes from 'prop-types';
import React from 'react';
import 'c3/c3.css';
import Grid from '../Grid';
import { GRAPH_INITIAL_SIZE } from '../../../constants';

const defaultProps = {
  size: GRAPH_INITIAL_SIZE,
};

const propTypes = {
  dps: PropTypes.arrayOf(PropTypes.object).isRequired,
  monitoredID: PropTypes.string.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any),
};

const GridGraph = ({
  dps,
  monitoredID,
  setSize,
  size,
}) => {
  const wrapperID = `graphWrapper-${monitoredID}`;
  const wrapper = document.getElementById(wrapperID);
  const dataPresent = !!dps.length;
  // No wrapper - the initial size would be impossible to compute
  // No ID - the D3 would go crazy in animations
  // No initial data - the grid wouldn't be generated
  const condition = !!(wrapper && monitoredID && dataPresent);
  return (
    <div
      id={wrapperID}
      style={{
        textAlign: 'center',
        justifyContent: 'center',
      }}
    >
      {condition && <Grid
        data={dps}
        setSize={setSize}
        size={size}
        graphID={monitoredID}
      />}
    </div>
  );
};

GridGraph.propTypes = propTypes;
GridGraph.defaultProps = defaultProps;

export default GridGraph;
