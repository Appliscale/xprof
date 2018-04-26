import React from 'react';
import PropTypes from 'prop-types';
import { TracingContainer, MonitoringContainer } from '../../containers';
import { FUNCTIONS_INTERVAL } from '../../constants';

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  mfas: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
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
    const { mfas } = this.props;
    return (
      <div>
        {mfas.map((mfa, index) => (
          <div key={mfa[3]}>
            <MonitoringContainer mfa={mfa} />
            <TracingContainer mfa={mfa} />
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
