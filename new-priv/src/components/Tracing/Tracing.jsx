import React from 'react';
import PropTypes from 'prop-types';
import { last } from 'lodash';
import CallsPanel from '../CallsPanel/CallsPanel';
import { CAPTURE_INTERVAL } from '../../constants';

const propTypes = {
  poolCapture: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  capture: PropTypes.objectOf(PropTypes.any).isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  controls: PropTypes.objectOf(PropTypes.any).isRequired,
};

class Tracing extends React.Component {
  componentWillMount() {
    const { poolCapture } = this.props;
    poolCapture();
    this.captureInterval = setInterval(poolCapture, CAPTURE_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.captureInterval);
  }

  render() {
    const {
      mfas,
      capture,
      toggleCallsTracing,
      toggleExpandItem,
      handleThresholdChange,
      handleLimitChange,
      controls,
    } = this.props;
    return (
      <div>
        {mfas.map(mfa => (
          <CallsPanel
            key={mfa[3]}
            mfa={mfa}
            lastCapture={last(capture[mfa[3]])}
            control={controls[mfa[3]]}
            handleThresholdChange={handleThresholdChange}
            handleLimitChange={handleLimitChange}
            toggleCallsTracing={toggleCallsTracing}
            // sortBy={sortBy}
            toggleExpandItem={toggleExpandItem}
          />
        ))}
      </div>
    );
  }
}

Tracing.propTypes = propTypes;

export default Tracing;
