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
} from '../../selectors';

const TracingContainer = props => <Tracing {...props} />;

const mapStateToProps = (state, ownProps) => ({
  mfa: ownProps.mfa,
  calls: getFunctionCalls(state, ownProps.mfa.query),
  controls: getFunctionControl(state, ownProps.mfa.query),
  panelVisibility: getFunctionTracingVisibility(state, ownProps.mfa.query),
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
