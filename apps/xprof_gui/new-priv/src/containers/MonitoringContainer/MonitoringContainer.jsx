import React from 'react';
import { connect } from 'react-redux';
import { Monitoring } from '../../components/monitoring';
import {
  getFunctionsData,
  getMonitoredFunctions,
  stopMonitoringFunction,
  showCallees,
  hideCallees,
  expandGraphPanel,
  shrinkGraphPanel,
  calleeClick,
} from '../../actions';
import {
  getData,
  getMfas,
  getCallees,
  getCalleesVisibility,
  getGraphVisibility,
} from '../../selectors';

const MonitoringContainer = props => <Monitoring {...props} />;

const mapStateToProps = state => ({
  mfas: getMfas(state),
  data: getData(state),
  callees: getCallees(state),
  calleesVisibility: getCalleesVisibility(state),
  panelVisibility: getGraphVisibility(state),
});

const mapDispatchToProps = {
  getMonitoredFunctions,
  getFunctionsData,
  stopMonitoringFunction,
  showCallees,
  hideCallees,
  expandGraphPanel,
  shrinkGraphPanel,
  calleeClick,
};

const con = connect(mapStateToProps, mapDispatchToProps)(MonitoringContainer);
export default con;
