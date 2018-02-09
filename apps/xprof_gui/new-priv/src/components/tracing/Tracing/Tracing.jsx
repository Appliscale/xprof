import React from 'react';
import PropTypes from 'prop-types';
import { last } from 'lodash';
import { CallsPanel } from '../';
import { CALLS_INTERVAL } from '../../../constants';

const defaultProps = {
  panelVisibility: false,
  calls: [],
};

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  getFunctionsCalls: PropTypes.func.isRequired,
  calls: PropTypes.arrayOf(PropTypes.object),
  toggleCallsTracing: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  controls: PropTypes.objectOf(PropTypes.any).isRequired,
  sortCallsBy: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expandTracingPanel: PropTypes.func.isRequired,
  shrinkTracingPanel: PropTypes.func.isRequired,
};

class Tracing extends React.Component {
  componentWillMount() {
    const { getFunctionsCalls } = this.props;
    getFunctionsCalls();
    this.callsInterval = setInterval(getFunctionsCalls, CALLS_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.callsInterval);
  }

  render() {
    const {
      mfa,
      calls,
      toggleCallsTracing,
      toggleExpandItem,
      handleThresholdChange,
      handleLimitChange,
      controls,
      sortCallsBy,
      panelVisibility,
      expandTracingPanel,
      shrinkTracingPanel,
    } = this.props;
    return (
      <div>
        <CallsPanel
          key={mfa[3]}
          mfa={mfa}
          lastCalls={last(calls)}
          control={controls}
          handleThresholdChange={handleThresholdChange}
          handleLimitChange={handleLimitChange}
          toggleCallsTracing={toggleCallsTracing}
          sortCallsBy={sortCallsBy}
          toggleExpandItem={toggleExpandItem}
          panelVisibility={panelVisibility}
          expand={expandTracingPanel}
          shrink={shrinkTracingPanel}
        />
      </div>
    );
  }
}

Tracing.defaultProps = defaultProps;
Tracing.propTypes = propTypes;

export default Tracing;
