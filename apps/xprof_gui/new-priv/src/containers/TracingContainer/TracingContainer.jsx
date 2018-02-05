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
  getCalls,
  getControls,
  getMfas,
  getTracingVisibility,
} from '../../selectors';

const MonitoringContainer = props => <Tracing {...props} />;

const mapStateToProps = state => ({
  mfas: getMfas(state),
  calls: getCalls(state),
  controls: getControls(state),
  panelVisibility: getTracingVisibility(state),
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

const con = connect(mapStateToProps, mapDispatchToProps)(MonitoringContainer);
export default con;
