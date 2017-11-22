import React from 'react';
import { connect } from 'react-redux';
import { Monitoring } from '../../components';
import { poolData, poolMonitoredFunctions } from '../../actions/PoolingActions';
import { stopMonitoringFunction } from '../../actions/MonitoringActions';
import { getData, getMfas } from '../../selectors/CommonSelectors';

const MonitoringContainer = props => <Monitoring {...props} />;

const sp = state => ({
  mfas: getMfas(state),
  data: getData(state),
});

const dp = {
  poolMonitoredFunctions,
  poolData,
  stopMonitoringFunction,
};

export default connect(sp, dp)(MonitoringContainer);
