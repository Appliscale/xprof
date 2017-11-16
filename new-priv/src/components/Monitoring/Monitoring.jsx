import React from 'react';
import PropTypes from 'prop-types';
import { FUNCTIONS_INTERVAL, DATA_INTERVAL } from '../../constants';

const propTypes = {
  poolMonitoredFunctions: PropTypes.func.isRequired,
  poolData: PropTypes.func.isRequired,
};

class Monitoring extends React.Component {
  componentWillMount() {
    const { poolMonitoredFunctions, poolData } = this.props;
    poolMonitoredFunctions();
    poolData();
    this.functionInterval = setInterval(poolMonitoredFunctions, FUNCTIONS_INTERVAL);
    this.dataInterval = setInterval(poolData, DATA_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
    clearInterval(this.dataInterval);
  }

  render() {
    return (
      <div>
        asdasd
        <p>HAHAHHA</p>
      </div>
    );
  }
}

Monitoring.propTypes = propTypes;

export default Monitoring;
