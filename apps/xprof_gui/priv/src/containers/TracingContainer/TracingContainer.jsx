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
} from '../../actions';
import {
  getFunctionCalls,
  getFunctionControl,
  getFunctionTracingVisibility,
  isConnection,
} from '../../selectors';

const TracingContainer = props => <Tracing {...props} />;

const mapStateToProps = (state, ownProps) => ({
  mfa: ownProps.mfa,
  calls: getFunctionCalls(state, ownProps.mfa[3]),
  controls: getFunctionControl(state, ownProps.mfa[3]),
  panelVisibility: getFunctionTracingVisibility(state, ownProps.mfa[3]),
  isConnection: isConnection(state),
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
};

const con = connect(mapStateToProps, mapDispatchToProps)(TracingContainer);
export default con;
