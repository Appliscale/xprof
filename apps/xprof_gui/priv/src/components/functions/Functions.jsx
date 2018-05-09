import React from 'react';
import PropTypes from 'prop-types';
import { TracingContainer, MonitoringContainer } from '../../containers';
import { FUNCTIONS_INTERVAL } from '../../constants';

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  })).isRequired,
  running: PropTypes.bool.isRequired,
};

class Functions extends React.Component {
  componentWillMount() {
    const { getMonitoredFunctions } = this.props;
    getMonitoredFunctions();

    this.functionInterval = setInterval(
      getMonitoredFunctions,
      FUNCTIONS_INTERVAL,
    );
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
  }

  render() {
    const { mfas, running } = this.props;
    return (
      <div>
        {mfas.map((m, index) => (
          <div key={m.query}>
            <MonitoringContainer mfa={m} running={running} />
            <TracingContainer mfa={m} />
            {index < mfas.length - 1 ? (
              <hr className="function-separator" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }
}

Functions.propTypes = propTypes;

export default Functions;
