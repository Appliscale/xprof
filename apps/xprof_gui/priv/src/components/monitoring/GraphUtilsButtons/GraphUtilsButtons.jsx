import PropTypes from 'prop-types';
import React from 'react';

const defaultProps = {
  panelVisibility: true,
  hasCallees: false,
};

const propTypes = {
  stopMonitoringFunction: PropTypes.func.isRequired,
  showCallees: PropTypes.func.isRequired,
  hasCallees: PropTypes.bool,
  panelVisibility: PropTypes.bool,
  expand: PropTypes.func.isRequired,
  shrink: PropTypes.func.isRequired,
  isConnection: PropTypes.bool.isRequired,
};

const GraphUtilsButtons = ({
  stopMonitoringFunction,
  showCallees,
  hasCallees,
  panelVisibility,
  expand,
  shrink,
  isConnection,
}) => (
  <span>
    <button
      onClick={stopMonitoringFunction}
      type="button"
      className="graph-util-button graph-utils-close close"
      data-dismiss="modal"
      aria-label="Close"
      disabled={!isConnection}
    >
      <span aria-hidden="true">&times;</span>
    </button>
    <button
      onClick={() => (panelVisibility ? shrink() : expand())}
      type="button"
      className="graph-util-button graph-utils-fold close"
      data-dismiss="modal"
      aria-label="Close"
    >
      <span
        className={
          panelVisibility
            ? 'glyphicon glyphicon-chevron-up'
            : 'glyphicon glyphicon-chevron-down'
        }
      />
    </button>
    {hasCallees ? (
      <button
        onClick={showCallees}
        type="button"
        className="graph-util-button graph-utils-callee close"
        data-dismiss="modal"
        aria-label="Close"
        disabled={!isConnection}
      >
        <span className="glyphicon glyphicon-thick glyphicon-search" />
      </button>
    ) : null}
  </span>
);

GraphUtilsButtons.defaultProps = defaultProps;
GraphUtilsButtons.propTypes = propTypes;

export default GraphUtilsButtons;
