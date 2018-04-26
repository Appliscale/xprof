import PropTypes from 'prop-types';
import React from 'react';
import { Graph, GraphPanelHeading } from '../';

const defaultProps = {
  dps: [],
  callees: [],
  calleesVisibility: false,
  panelVisibility: true,
};

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  dps: PropTypes.arrayOf(PropTypes.object),
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

const GraphPanel = ({
  mfa,
  dps,
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
  <div className="panel panel-default">
    <GraphPanelHeading
      mfa={mfa}
      stopMonitoringFunction={() => stopMonitoringFunction(mfa)}
      callees={callees}
      calleesVisibility={calleesVisibility}
      showCallees={() => showCallees(mfa[3])}
      hideCallees={() => hideCallees(mfa[3])}
      panelVisibility={panelVisibility}
      expand={() => expand(mfa[3])}
      shrink={() => shrink(mfa[3])}
      calleeClick={calleeClick}
    />
    {panelVisibility ? (
      <div className="panel-body">
        <Graph dps={dps} />
      </div>
    ) : null}
  </div>
);

GraphPanel.defaultProps = defaultProps;
GraphPanel.propTypes = propTypes;

export default GraphPanel;
