import React from 'react';
import PropTypes from 'prop-types';
import GraphPanel from '../GraphPanel/GraphPanel';
import { FUNCTIONS_INTERVAL, DATA_INTERVAL } from '../../constants';

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
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
    const { mfas, data, stopMonitoringFunction } = this.props;
    return (
      <div>
        {mfas.map(mfa => (
          <GraphPanel
            key={mfa[3]}
            mfa={mfa}
            dps={data[mfa[3]]}
            stopMonitoringFunction={stopMonitoringFunction}
          />
        ))}
      </div>
    );
  }
}

Monitoring.propTypes = propTypes;

export default Monitoring;
