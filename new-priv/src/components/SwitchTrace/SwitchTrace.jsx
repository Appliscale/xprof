import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  status: PropTypes.string.isRequired,
  toggleTraceStatus: PropTypes.func.isRequired,
};

const SwitchTrace = ({ status, toggleTraceStatus }) => {
  let text = '';
  let symbol = 'glyphicon glyphicon-';
  let btnclass = 'btn btn-';

  if (status === 'running') {
    text = 'Pause Tracing';
    symbol += 'pause';
    btnclass += 'danger';
  } else if (status === 'paused' || status === 'initialized') {
    text = 'Trace All';
    symbol += 'record';
    btnclass += 'success';
  } else if (status === 'overflow') {
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

SwitchTrace.propTypes = propTypes;

export default SwitchTrace;
