import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { DATA_INTERVAL } from '../../../constants';

const defaultProps = {
  panelVisibility: true,
  data: [],
  callees: [],
  calleesVisibility: false,
};

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  stopMonitoringFunction: PropTypes.func.isRequired,
  callees: PropTypes.arrayOf(PropTypes.string),
  calleesVisibility: PropTypes.bool,
  showCallees: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expandGraphPanel: PropTypes.func.isRequired,
  shrinkGraphPanel: PropTypes.func.isRequired,
  calleeClick: PropTypes.func.isRequired,
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
      mfa,
      data,
      stopMonitoringFunction,
      callees,
      calleesVisibility,
      showCallees,
      hideCallees,
      panelVisibility,
      expandGraphPanel,
      shrinkGraphPanel,
      calleeClick,
    } = this.props;
    return (
      <div>
        <GraphPanel
          key={mfa[3]}
          mfa={mfa}
          dps={data}
          stopMonitoringFunction={stopMonitoringFunction}
          callees={callees}
          calleesVisibility={calleesVisibility}
          showCallees={showCallees}
          hideCallees={hideCallees}
          panelVisibility={panelVisibility}
          expand={expandGraphPanel}
          shrink={shrinkGraphPanel}
          calleeClick={calleeClick}
        />
      </div>
    );
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
