import PropTypes from 'prop-types';
import React from 'react';
import CallsRow from '../CallsRow/CallsRow';
import { CALLS_COLUMNS } from '../../constants';

const defaultProps = {
  items: [],
};
const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  sortBy: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
};

const CallsTable = ({
  mfa, items, sortBy, toggleExpandItem,
}) => (
  <table className="table table-hover table-striped">
    <thead>
      <tr>
        <th />
        <th onClick={() => sortBy(CALLS_COLUMNS.ID)}>No.</th>
        <th onClick={() => sortBy(CALLS_COLUMNS.CALL_TIME)}>Call time</th>
        <th onClick={() => sortBy(CALLS_COLUMNS.PID)}>Pid</th>
        <th onClick={() => sortBy(CALLS_COLUMNS.ARGS)}>Function arguments</th>
        <th onClick={() => sortBy(CALLS_COLUMNS.RES)}>Return value</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <CallsRow
          key={item.id}
          mfa={mfa}
          item={item}
          toggleExpandItem={toggleExpandItem}
        />
      ))}
    </tbody>
  </table>
);

CallsTable.defaultProps = defaultProps;
CallsTable.propTypes = propTypes;

export default CallsTable;
