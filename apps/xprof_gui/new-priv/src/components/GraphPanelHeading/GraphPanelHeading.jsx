import PropTypes from 'prop-types';
import React from 'react';
import GraphUtilsButtons from '../GraphUtilsButtons/GraphUtilsButtons';

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
};

const GraphPanelHeading = ({ mfa, stopMonitoringFunction }) => (
  <div className="panel-heading">
    <GraphUtilsButtons
      mfa={mfa}
      stopMonitoringFunction={stopMonitoringFunction}
    />
    <h3 className="panel-title">{mfa[3]}</h3>
  </div>
);

GraphPanelHeading.propTypes = propTypes;

export default GraphPanelHeading;
