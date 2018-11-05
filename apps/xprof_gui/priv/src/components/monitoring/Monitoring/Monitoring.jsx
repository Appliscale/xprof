import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { DATA_INTERVAL, GRAPH_INITIAL_SIZE } from '../../../constants';

const defaultProps = {
  panelVisibility: true,
  data: [],
  y: [],
  callees: [],
  calleesVisibility: false,
  size: GRAPH_INITIAL_SIZE,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  y: PropTypes.arrayOf(PropTypes.string),
  stopMonitoringFunction: PropTypes.func.isRequired,
  callees: PropTypes.arrayOf(PropTypes.string),
  calleesVisibility: PropTypes.bool,
  showCallees: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expandGraphPanel: PropTypes.func.isRequired,
  shrinkGraphPanel: PropTypes.func.isRequired,
  calleeClick: PropTypes.func.isRequired,
  isConnection: PropTypes.bool.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any),
  ids: PropTypes.shape(PropTypes.any).isRequired,
};

class Monitoring extends React.Component {
  componentWillMount() {
    const { getFunctionsData } = this.props;
    getFunctionsData();
    this.dataInterval = setInterval(getFunctionsData, DATA_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
    clearInterval(this.dataInterval);
  }

  render() {
    const {
      monitored,
      data,
      y,
      stopMonitoringFunction,
      callees,
      calleesVisibility,
      showCallees,
      hideCallees,
      panelVisibility,
      expandGraphPanel,
      shrinkGraphPanel,
      calleeClick,
      isConnection,
      setSize,
      size,
      ids,
    } = this.props;
    return (
      <div>
        <GraphPanel
          key={monitored.query}
          monitored={monitored}
          dps={data}
          y={y}
          stopMonitoringFunction={stopMonitoringFunction}
          callees={callees}
          calleesVisibility={calleesVisibility}
          showCallees={showCallees}
          hideCallees={hideCallees}
          panelVisibility={panelVisibility}
          expand={expandGraphPanel}
          shrink={shrinkGraphPanel}
          calleeClick={calleeClick}
          isConnection={isConnection}
          setSize={setSize}
          size={size}
          ids={ids}
        />
      </div>
    );
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
