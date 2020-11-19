import PropTypes from 'prop-types';
import React from 'react';
import { CallsRow } from '../';
import { CALLS_COLUMNS, SORT } from '../../../constants';

const defaultProps = {
  sort: { items: [] },
};
const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  sort: PropTypes.objectOf(PropTypes.any),
  sortCallsBy: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
};

const CallsTable = ({
  monitored, sort, sortCallsBy, toggleExpandItem,
}) => {
  const sortIcon = (column) => {
    const isActive = sort.column === column;
    const dir = isActive && sort.order === SORT.ASCENDING ? 'top' : 'bottom';
    const glyphicon = `glyphicon glyphicon-triangle-${dir}`;
    const style = ` call-tracer-sort-${isActive ? 'active' : 'inactive'}`;
    return <span className={glyphicon + style} />;
  };

  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th />
          <th onClick={() => sortCallsBy(monitored, CALLS_COLUMNS.ID)}>
            <span className="clickable">No. {sortIcon(CALLS_COLUMNS.ID)}</span>
          </th>
          <th onClick={() => sortCallsBy(monitored, CALLS_COLUMNS.CALL_TIME)}>
            <span className="clickable">
              Call time {sortIcon(CALLS_COLUMNS.CALL_TIME)}
            </span>
          </th>
          <th onClick={() => sortCallsBy(monitored, CALLS_COLUMNS.PID)}>
            <span className="clickable">Pid {sortIcon(CALLS_COLUMNS.PID)}</span>
          </th>
          <th onClick={() => sortCallsBy(monitored, CALLS_COLUMNS.ARGS)}>
            <span className="clickable">
              Function arguments {sortIcon(CALLS_COLUMNS.ARGS)}
            </span>
          </th>
          <th onClick={() => sortCallsBy(monitored, CALLS_COLUMNS.RES)}>
            <span className="clickable">
              Return value {sortIcon(CALLS_COLUMNS.RES)}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sort.items.map(item => (
          <CallsRow
            key={item.id}
            monitored={monitored}
            item={item}
            toggleExpandItem={toggleExpandItem}
          />
        ))}
      </tbody>
    </table>
  );
};

CallsTable.defaultProps = defaultProps;
CallsTable.propTypes = propTypes;

export default CallsTable;
