import React from 'react';
import PropTypes from 'prop-types';
import { INPUT_TYPE } from '../../../constants';

const defaultProps = {
  selected: INPUT_TYPE.SEARCH,
};

const propTypes = {
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.string,
};

const InputSwitch = ({ onChange, selected }) => (
  <div className="input-group-btn" style={{ width: '1%' }}>
    <button
      type="button"
      disabled={selected === INPUT_TYPE.FAVOURITES}
      className={`btn btn-default ${selected === INPUT_TYPE.FAVOURITES
        ? 'btn-active-disabled'
        : ''}`}
      onClick={() => onChange(INPUT_TYPE.FAVOURITES)}
    >
      <span className="glyphicon glyphicon-star" />
    </button>
    <button
      type="button"
      disabled={selected === INPUT_TYPE.SEARCH}
      className={`btn btn-default ${selected === INPUT_TYPE.SEARCH
        ? 'btn-active-disabled'
        : ''}`}
      onClick={() => onChange(INPUT_TYPE.SEARCH)}
    >
      <span className="glyphicon glyphicon-search" />
    </button>
  </div>
);

InputSwitch.defaultProps = defaultProps;
InputSwitch.propTypes = propTypes;

export default InputSwitch;
