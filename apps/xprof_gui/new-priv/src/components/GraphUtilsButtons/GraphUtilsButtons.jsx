import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
};

const GraphUtilsButtons = ({ mfa, stopMonitoringFunction }) => (
  <button
    onClick={() => stopMonitoringFunction(mfa)}
    type="button"
    className="close"
    data-dismiss="modal"
    aria-label="Close"
  >
    <span aria-hidden="true">&times;</span>
  </button>
);

GraphUtilsButtons.propTypes = propTypes;

export default GraphUtilsButtons;
