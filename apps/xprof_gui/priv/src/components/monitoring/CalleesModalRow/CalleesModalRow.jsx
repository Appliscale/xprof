import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  callee: PropTypes.string.isRequired,
  calleeClick: PropTypes.func.isRequired,
};

const CalleesModalRow = ({ callee, calleeClick }) => (
  <tr onClick={() => calleeClick(callee)}>
    <td className="callee-item">{callee}</td>
  </tr>
);

CalleesModalRow.propTypes = propTypes;

export default CalleesModalRow;
