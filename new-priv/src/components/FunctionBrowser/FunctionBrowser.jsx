import PropTypes from 'prop-types';
import React from 'react';
import { QueryInput, ACModal } from '../';

const defaultProps = {
  position: -1,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  handleKeyDown: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFunctionClickedModal: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const FunctionBrowser = ({
  handleKeyDown,
  handleInputChange,
  value,
  placeholder,
  functions,
  onFunctionClickedModal,
  position,
}) => (
  <form className="navbar-form">
    <div className="form-group" style={{ display: 'inline' }}>
      <div className="input-group" style={{ display: 'table' }}>
        <span className="input-group-addon" style={{ width: '1%' }}>
          <span className="glyphicon glyphicon-search" />
        </span>
        <QueryInput
          handleKeyDown={handleKeyDown}
          handleInputChange={handleInputChange}
          value={value}
          placeholder={placeholder}
        />
        <ACModal
          functions={functions}
          onFunctionClickedModal={onFunctionClickedModal}
          position={position}
        />
      </div>
    </div>
  </form>
);

FunctionBrowser.defaultProps = defaultProps;
FunctionBrowser.propTypes = propTypes;

export default FunctionBrowser;
