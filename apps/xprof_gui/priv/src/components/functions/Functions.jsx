import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';

import { TracingContainer, MonitoringContainer } from '../../containers';
import { FUNCTIONS_INTERVAL } from '../../constants';

const propTypes = {
  getMonitoredFunctions: PropTypes.func.isRequired,
  monitoredCollection: PropTypes.arrayOf(PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  })).isRequired,
  grid: PropTypes.number.isRequired,
};

class Functions extends React.Component {
  static renderRow(row, columns, coll, grid, notLast) {
    return (
      <div key={row}>
        <div className="row">
          {range(0, columns).map(column => (
            <div key={`${row}-${column}`} className={`col-sm-${12 / columns}`}>
              {/* eslint-disable */}
              <MonitoringContainer monitored={coll[row * grid + column]} />
              {/* eslint-enable */}
            </div>
          ))}
        </div>
        {range(0, columns).map(column => (
          // eslint-disable-next-line
          <TracingContainer monitored={coll[row * grid + column]} />
        ))}
        {notLast ? <hr className="function-separator" /> : null}
      </div>
    );
  }

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
    const { monitoredCollection, grid } = this.props;
    const lastRowColumns = monitoredCollection.length % grid;
    const rows = Math.ceil(monitoredCollection.length / grid);
    return (
      <div>
        {range(0, rows).map(row =>
            (row === rows - 1 && lastRowColumns !== 0
              ? Functions.renderRow(
                  row,
                  lastRowColumns,
                  monitoredCollection,
                  grid,
                )
              : Functions.renderRow(
                  row,
                  grid,
                  monitoredCollection,
                  grid,
                  row !== rows - 1,
                )))}
      </div>
    );
  }
}

Functions.propTypes = propTypes;

export default Functions;
