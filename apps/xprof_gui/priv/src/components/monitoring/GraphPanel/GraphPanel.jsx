import PropTypes from 'prop-types';
import React from 'react';
import { Graph, GraphPanelHeading } from '../';
import { GRAPH_INITIAL_SIZE } from '../../../constants';
import { safecomposeID } from '../../../utils';

const defaultProps = {
  dps: [],
  callees: [],
  calleesVisibility: false,
  panelVisibility: true,
  size: GRAPH_INITIAL_SIZE,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
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
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any),
};

const GraphPanel = ({
  monitored,
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
  setSize,
  size,
}) => {
  const monitoredID = safecomposeID(monitored.query);
  return (
    <div className="panel panel-default">
      <GraphPanelHeading
        monitored={monitored}
        stopMonitoringFunction={() => stopMonitoringFunction(monitored)}
        callees={callees}
        calleesVisibility={calleesVisibility}
        showCallees={() => showCallees(monitored.query)}
        hideCallees={() => hideCallees(monitored.query)}
        panelVisibility={panelVisibility}
        expand={() => expand(monitored.query)}
        shrink={() => shrink(monitored.query)}
        calleeClick={calleeClick}
      />
      {panelVisibility && monitoredID ? (
        <div className="panel-body">
          <Graph
            dps={dps}
            type={monitored.graph_type}
            query={monitored.query}
            monitoredID={monitoredID}
            setSize={setSize}
            size={size}
          />
        </div>
      ) : null}
    </div>
  );
};

GraphPanel.defaultProps = defaultProps;
GraphPanel.propTypes = propTypes;

export default GraphPanel;
