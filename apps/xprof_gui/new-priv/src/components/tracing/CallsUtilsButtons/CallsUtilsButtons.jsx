import PropTypes from 'prop-types';
import React from 'react';

const defaultProps = {
  panelVisibility: false,
};

const propTypes = {
  panelVisibility: PropTypes.bool,
  expand: PropTypes.func.isRequired,
  shrink: PropTypes.func.isRequired,
};

const CallsUtilsButtons = ({ panelVisibility, expand, shrink }) => (
  <span>
    <button
      onClick={() => (panelVisibility ? shrink() : expand())}
      type="button"
      className="graph-util-button graph-utils-fold close"
      data-dismiss="modal"
      aria-label="Close"
    >
      <span
        className={
          panelVisibility
            ? 'glyphicon glyphicon-chevron-up'
            : 'glyphicon glyphicon-chevron-down'
        }
      />
    </button>
  </span>
);

CallsUtilsButtons.defaultProps = defaultProps;
CallsUtilsButtons.propTypes = propTypes;

export default CallsUtilsButtons;
