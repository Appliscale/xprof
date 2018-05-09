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
  getFunctionData,
  getFunctionCallees,
  getFunctionCalleesVisibility,
  getFunctionGraphVisibility,
} from '../../selectors';

const MonitoringContainer = props => <Monitoring {...props} />;

const mapStateToProps = (state, ownProps) => ({
  mfa: ownProps.mfa,
  data: getFunctionData(state, ownProps.mfa.query),
  callees: getFunctionCallees(state, ownProps.mfa.query),
  calleesVisibility: getFunctionCalleesVisibility(state, ownProps.mfa.query),
  panelVisibility: getFunctionGraphVisibility(state, ownProps.mfa.query),
  running: ownProps.running,
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
