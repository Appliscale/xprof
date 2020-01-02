import React from 'react';
import { connect } from 'react-redux';
import { Tracing } from '../../components/tracing';
import {
  getFunctionsCalls,
  handleLimitChange,
  handleThresholdChange,
  toggleCallsTracing,
  toggleExpandItem,
  sortCallsBy,
  expandTracingPanel,
  shrinkTracingPanel,
  nextCallsPagination,
  previousCallsPagination,
  setCallsPage,
} from '../../actions';
import {
  getCurrentCallsForFunction,
  getFunctionControl,
  getFunctionTracingVisibility,
  isConnection,
  getCountCallsPages,
  getCurrentCallsPage,
  getStartCallsPage,
} from '../../selectors';

const TracingContainer = props => <Tracing {...props} />;

const mapStateToProps = (state, ownProps) => ({
  monitored: ownProps.monitored,
  currentCalls: getCurrentCallsForFunction(state, ownProps.monitored.query),
  controls: getFunctionControl(state, ownProps.monitored.query),
  panelVisibility: getFunctionTracingVisibility(
    state,
    ownProps.monitored.query,
  ),
  isConnection: isConnection(state),
  countCallsPages: getCountCallsPages(state, ownProps.monitored.query),
  currentCallsPage: getCurrentCallsPage(state, ownProps.monitored.query),
  startCallsPage: getStartCallsPage(state, ownProps.monitored.query),
});

const mapDispatchToProps = {
  getFunctionsCalls,
  toggleCallsTracing,
  toggleExpandItem,
  handleThresholdChange,
  handleLimitChange,
  sortCallsBy,
  expandTracingPanel,
  shrinkTracingPanel,
  nextCallsPagination,
  previousCallsPagination,
  setCallsPage,
};

const con = connect(mapStateToProps, mapDispatchToProps)(TracingContainer);
export default con;
