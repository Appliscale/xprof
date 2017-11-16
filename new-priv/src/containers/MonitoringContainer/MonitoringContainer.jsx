import React from 'react';
import { connect } from 'react-redux';
import { Monitoring } from '../../components';
import { poolData, poolMonitoredFunctions } from '../../actions/PoolingActions';

const MonitoringContainer = props => <Monitoring {...props} />;

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  poolMonitoredFunctions,
  poolData,
};

export default connect(mapStateToProps, mapDispatchToProps)(MonitoringContainer);
