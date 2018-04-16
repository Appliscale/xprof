import PropTypes from 'prop-types';
import React from 'react';
import { CalleesModalRow } from '../';

const propTypes = {
  callees: PropTypes.arrayOf(PropTypes.string).isRequired,
  calleeClick: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
};

const CalleesModal = ({ callees, calleeClick, hideCallees }) => (
  <div className="callees-panel-parent">
    {callees.length ? (
      <div
        onMouseLeave={hideCallees}
        className="panel panel-default callees-panel"
      >
        <table className="table table-striped">
          <tbody>
            {callees.map(callee => (
              <CalleesModalRow
                key={callee}
                callee={callee}
                calleeClick={calleeClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    ) : null}
  </div>
);

CalleesModal.propTypes = propTypes;

export default CalleesModal;
