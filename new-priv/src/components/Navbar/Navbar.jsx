import PropTypes from 'prop-types';
import React from 'react';
import { FunctionBrowser, TracingSwitch } from '../';

const defaultProps = {
  position: -1,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  status: PropTypes.string.isRequired,
  toggleTraceStatus: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFunctionClickedModal: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const Navbar = ({
  status,
  toggleTraceStatus,
  handleKeyDown,
  handleInputChange,
  value,
  placeholder,
  functions,
  onFunctionClickedModal,
  position,
}) => (
  <nav className="navbar navbar-default navbar-fixed-top">
    <div className="navbar-header">
      <a className="navbar-brand" href="#top">
        <img src="img/xprof_logo.png" alt="XProf logo" height="45px" />
      </a>
    </div>
    <div className="navbar-collapse collapse" id="navbar-collapsible">
      <TracingSwitch status={status} toggleTraceStatus={toggleTraceStatus} />
      <FunctionBrowser
        handleKeyDown={handleKeyDown}
        handleInputChange={handleInputChange}
        value={value}
        placeholder={placeholder}
        functions={functions}
        onFunctionClickedModal={onFunctionClickedModal}
        position={position}
      />
    </div>
  </nav>
);

Navbar.defaultProps = defaultProps;
Navbar.propTypes = propTypes;

export default Navbar;
