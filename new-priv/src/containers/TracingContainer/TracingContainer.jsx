import React from 'react';
import { connect } from 'react-redux';
import { Tracing } from '../../components';
import { poolCapture } from '../../actions/PoolingActions';
import {
  handleLimitChange,
  handleThresholdChange,
  toggleCallsTracing,
  toggleExpandItem,
} from '../../actions/TracingActions';

import {
  getCapture,
  getControls,
  getMfas,
} from '../../selectors/CommonSelectors';

const MonitoringContainer = props => <Tracing {...props} />;

const sp = state => ({
  mfas: getMfas(state),
  capture: getCapture(state),
  controls: getControls(state),
});

const dp = {
  poolCapture,
  toggleCallsTracing,
  toggleExpandItem,
  handleThresholdChange,
  handleLimitChange,
};

export default connect(sp, dp)(MonitoringContainer);
