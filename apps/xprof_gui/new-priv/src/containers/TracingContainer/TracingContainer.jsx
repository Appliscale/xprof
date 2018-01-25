import React from 'react';
import { connect } from 'react-redux';
import { Tracing } from '../../components';
import { getFunctionsCalls } from '../../actions/CollectingActions';
import {
  handleLimitChange,
  handleThresholdChange,
  toggleCallsTracing,
  toggleExpandItem,
} from '../../actions/TracingActions';

import {
  getCalls,
  getControls,
  getMfas,
} from '../../selectors/CommonSelectors';

const MonitoringContainer = props => <Tracing {...props} />;

const mapStateToProps = state => ({
  mfas: getMfas(state),
  calls: getCalls(state),
  controls: getControls(state),
});

const mapDispatchToProps = {
  getFunctionsCalls,
  toggleCallsTracing,
  toggleExpandItem,
  handleThresholdChange,
  handleLimitChange,
};

const con = connect(mapStateToProps, mapDispatchToProps)(MonitoringContainer);
export default con;
