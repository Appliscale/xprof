import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { FUNCTIONS_INTERVAL, DATA_INTERVAL } from '../../../constants';

const defaultProps = {
  panelVisibility: {},
};

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
  callees: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  calleesVisibility: PropTypes.objectOf(PropTypes.bool).isRequired,
  showCallees: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
  panelVisibility: PropTypes.objectOf(PropTypes.bool),
  expandGraphPanel: PropTypes.func.isRequired,
  shrinkGraphPanel: PropTypes.func.isRequired,
  calleeClick: PropTypes.func.isRequired,
};

class Monitoring extends React.Component {
  componentWillMount() {
    const { getMonitoredFunctions, getFunctionsData } = this.props;
    getMonitoredFunctions();
    getFunctionsData();

    this.functionInterval = setInterval(
      getMonitoredFunctions,
      FUNCTIONS_INTERVAL,
    );
    this.dataInterval = setInterval(getFunctionsData, DATA_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
    clearInterval(this.dataInterval);
  }

  render() {
    const {
      mfas,
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
        {mfas.map(mfa => (
          <GraphPanel
            key={mfa[3]}
            mfa={mfa}
            dps={data[mfa[3]]}
            stopMonitoringFunction={stopMonitoringFunction}
            callees={callees[mfa[3]]}
            calleesVisibility={calleesVisibility[mfa[3]]}
            showCallees={showCallees}
            hideCallees={hideCallees}
            panelVisibility={panelVisibility[mfa[3]]}
            expand={expandGraphPanel}
            shrink={shrinkGraphPanel}
            calleeClick={calleeClick}
          />
        ))}
        {mfas.length ? <hr /> : null}
      </div>
    );
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
