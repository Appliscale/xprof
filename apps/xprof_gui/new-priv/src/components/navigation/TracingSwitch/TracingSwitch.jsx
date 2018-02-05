import PropTypes from 'prop-types';
import React from 'react';
import { STATUS } from '../../../constants';

const propTypes = {
  status: PropTypes.string.isRequired,
  toggleTraceStatus: PropTypes.func.isRequired,
};

const TracingSwitch = ({ status, toggleTraceStatus }) => {
  let text = '';
  let symbol = 'glyphicon glyphicon-';
  let btnclass = 'btn btn-';

  if (status === STATUS.RUNNING) {
    text = 'Pause Tracing';
    symbol += 'pause';
    btnclass += 'danger';
  } else if (status === STATUS.PAUSED || status === STATUS.INIT) {
    text = 'Trace All';
    symbol += 'record';
    btnclass += 'success';
  } else if (status === STATUS.OVERFLOW) {
    text = 'Overflow! - resume trace all';
    symbol += 'record';
    btnclass += 'warning';
  }

  return (
    <form className="navbar-form navbar-left" role="search">
      <button type="button" onClick={toggleTraceStatus} className={btnclass}>
        <span className={symbol} aria-hidden="true" /> {text}
      </button>
    </form>
  );
};

TracingSwitch.propTypes = propTypes;

export default TracingSwitch;
