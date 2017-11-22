import React from 'react';
import PropTypes from 'prop-types';
import GraphPanel from '../GraphPanel/GraphPanel';
import { FUNCTIONS_INTERVAL, DATA_INTERVAL } from '../../constants';

const propTypes = {
  poolMonitoredFunctions: PropTypes.func.isRequired,
  poolData: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  stopMonitoringFunction: PropTypes.func.isRequired,
};

class Monitoring extends React.Component {
  componentWillMount() {
    const { poolMonitoredFunctions, poolData } = this.props;
    poolMonitoredFunctions();
    poolData();
    this.functionInterval = setInterval(
      poolMonitoredFunctions,
      FUNCTIONS_INTERVAL,
    );
    this.dataInterval = setInterval(poolData, DATA_INTERVAL);
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
