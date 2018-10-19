import PropTypes from 'prop-types';
import React from 'react';

const defaultProps = {
  disabled: false,
};

const propTypes = {
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const GridSwitch = ({ onChange, disabled }) => (
  <form className="navbar-form navbar-right navbar-right-more-margin">
    <button
      type="button"
      className="btn btn-default btn-grid-switch"
      onClick={onChange}
      disabled={disabled}
    >
      <span
        className="glyphicon glyphicon-th-large glyphicon-grid-switch"
        aria-hidden="true"
      />
    </button>
  </form>
);

GridSwitch.defaultProps = defaultProps;
GridSwitch.propTypes = propTypes;

export default GridSwitch;
