import React from 'react';
import { connect } from 'react-redux';
import { Monitoring } from '../../components';
import {
  getFunctionsData,
  getMonitoredFunctions,
} from '../../actions/CollectingActions';
import { stopMonitoringFunction } from '../../actions/MonitoringActions';
import { getData, getMfas } from '../../selectors/CommonSelectors';

const MonitoringContainer = props => <Monitoring {...props} />;

const mapStateToProps = state => ({
  mfas: getMfas(state),
  data: getData(state),
});

const mapDispatchToProps = {
  getMonitoredFunctions,
  getFunctionsData,
  stopMonitoringFunction,
};

const con = connect(mapStateToProps, mapDispatchToProps)(MonitoringContainer);
export default con;
