import PropTypes from 'prop-types';
import React from 'react';
import { GraphUtilsButtons, CalleesModal } from '../';

const defaultProps = {
  callees: [],
  calleesVisibility: false,
  panelVisibility: true,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
  callees: PropTypes.arrayOf(PropTypes.string),
  calleesVisibility: PropTypes.bool,
  showCallees: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expand: PropTypes.func.isRequired,
  shrink: PropTypes.func.isRequired,
  calleeClick: PropTypes.func.isRequired,
};

const GraphPanelHeading = ({
  monitored,
  stopMonitoringFunction,
  callees,
  calleesVisibility,
  showCallees,
  hideCallees,
  panelVisibility,
  expand,
  shrink,
  calleeClick,
}) => (
  <div className="panel-heading">
    <GraphUtilsButtons
      monitored={monitored}
      stopMonitoringFunction={stopMonitoringFunction}
      showCallees={showCallees}
      hasCallees={!!callees.length}
      panelVisibility={panelVisibility}
      expand={expand}
      shrink={shrink}
    />
    <h3 className="panel-title">
      {monitored.query}
      <span className="panel-subtitle"> - Monitoring</span>
    </h3>
    {calleesVisibility ? (
      <CalleesModal
        callees={callees}
        calleeClick={calleeClick}
        hideCallees={hideCallees}
      />
    ) : null}
  </div>
);

GraphPanelHeading.defaultProps = defaultProps;
GraphPanelHeading.propTypes = propTypes;

export default GraphPanelHeading;
