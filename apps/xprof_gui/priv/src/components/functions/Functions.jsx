import React from 'react';
import PropTypes from 'prop-types';
import { TracingContainer, MonitoringContainer } from '../../containers';
import { FUNCTIONS_INTERVAL } from '../../constants';

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  monitoredCollection: PropTypes.arrayOf(PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  })).isRequired,
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
    const { monitoredCollection } = this.props;
    return (
      <div>
        {monitoredCollection.map((monitored, index) => (
          <div key={monitored.query}>
            <MonitoringContainer monitored={monitored} />
            <TracingContainer monitored={monitored} />
            {index < monitoredCollection.length - 1 ? (
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
