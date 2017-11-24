import PropTypes from 'prop-types';
import React from 'react';
import { FavouriteContainer } from '../../containers';

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
};

const GraphUtilsButtons = ({ mfa, stopMonitoringFunction }) => (
  <div className="pull-right" role="group" aria-label="Panel buttons">
    <span>
      <FavouriteContainer functionName={mfa[3]} />
    </span>
    <button
      type="button"
      className="icon-button glyphicon glyphicon-remove"
      aria-hidden="true"
      data-dismiss="modal"
      onClick={() => stopMonitoringFunction(mfa)}
    />
  </div>
);

GraphUtilsButtons.propTypes = propTypes;

export default GraphUtilsButtons;
