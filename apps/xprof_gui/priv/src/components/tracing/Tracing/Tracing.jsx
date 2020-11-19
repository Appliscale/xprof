import React from 'react';
import PropTypes from 'prop-types';
import { CallsPanel } from '../';
import { CALLS_INTERVAL } from '../../../constants';

const defaultProps = {
  panelVisibility: false,
  currentCalls: {},
  currentCallsPage: 0,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  getFunctionsCalls: PropTypes.func.isRequired,
  currentCalls: PropTypes.arrayOf(PropTypes.object),
  toggleCallsTracing: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  controls: PropTypes.objectOf(PropTypes.any).isRequired,
  sortCallsBy: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expandTracingPanel: PropTypes.func.isRequired,
  shrinkTracingPanel: PropTypes.func.isRequired,
  isConnection: PropTypes.bool.isRequired,
  currentCallsPage: PropTypes.number,
  countCallsPages: PropTypes.number.isRequired,
  startCallsPage: PropTypes.number.isRequired,
  nextCallsPagination: PropTypes.func.isRequired,
  previousCallsPagination: PropTypes.func.isRequired,
  setCallsPage: PropTypes.func.isRequired,
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
      monitored,
      currentCalls,
      toggleCallsTracing,
      toggleExpandItem,
      handleThresholdChange,
      handleLimitChange,
      controls,
      sortCallsBy,
      panelVisibility,
      expandTracingPanel,
      shrinkTracingPanel,
      isConnection,
      currentCallsPage,
      countCallsPages,
      startCallsPage,
      nextCallsPagination,
      previousCallsPagination,
      setCallsPage,
    } = this.props;
    return (
      <div>
        <CallsPanel
          key={monitored.query}
          monitored={monitored}
          currentCalls={currentCalls}
          control={controls}
          handleThresholdChange={handleThresholdChange}
          handleLimitChange={handleLimitChange}
          toggleCallsTracing={toggleCallsTracing}
          sortCallsBy={sortCallsBy}
          toggleExpandItem={toggleExpandItem}
          panelVisibility={panelVisibility}
          expand={expandTracingPanel}
          shrink={shrinkTracingPanel}
          isConnection={isConnection}
          currentCallsPage={currentCallsPage}
          countCallsPages={countCallsPages}
          startCallsPage={startCallsPage}
          nextCallsPagination={nextCallsPagination}
          previousCallsPagination={previousCallsPagination}
          setCallsPage={setCallsPage}
        />
      </div>
    );
  }
}

Tracing.defaultProps = defaultProps;
Tracing.propTypes = propTypes;

export default Tracing;
