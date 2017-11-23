import PropTypes from 'prop-types';
import React from 'react';
import Graph from '../Graph/Graph';
import GraphPanelHeading from '../GraphPanelHeading/GraphPanelHeading';

const defaultProps = {
  dps: [],
};
const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  dps: PropTypes.arrayOf(PropTypes.object),
  stopMonitoringFunction: PropTypes.func.isRequired,
};

const GraphPanel = ({ mfa, dps, stopMonitoringFunction }) => (
  <div className="panel panel-default">
    <GraphPanelHeading
      mfa={mfa}
      stopMonitoringFunction={stopMonitoringFunction}
    />
    <div className="panel-body">
      <Graph dps={dps} />
    </div>
  </div>
);

GraphPanel.defaultProps = defaultProps;
GraphPanel.propTypes = propTypes;

export default GraphPanel;
