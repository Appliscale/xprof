import PropTypes from 'prop-types';
import React from 'react';
import { FunctionBrowser, TracingSwitch } from '../';
import logo from './logo.png';

const defaultProps = {
  position: -1,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
  error: false,
};

const propTypes = {
  status: PropTypes.string.isRequired,
  toggleTraceStatus: PropTypes.func.isRequired,
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
  error: PropTypes.bool,
};

const Navbar = ({
  status,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
  query,
  placeholder,
  functions,
  functionClick,
  position,
  error,
}) => (
  <nav className="navbar navbar-default navbar-fixed-top">
    <div className="navbar-header">
      <a className="navbar-brand" href="#top">
        <img src={logo} alt="XProf logo" height="45px" />
      </a>
    </div>
    <div className="navbar-collapse collapse" id="navbar-collapsible">
      <TracingSwitch status={status} toggleTraceStatus={toggleTraceStatus} />
      <FunctionBrowser
        queryKeyDown={queryKeyDown}
        queryInputChange={queryInputChange}
        query={query}
        placeholder={placeholder}
        functions={functions}
        functionClick={functionClick}
        position={position}
        error={error}
      />
    </div>
  </nav>
);

Navbar.defaultProps = defaultProps;
Navbar.propTypes = propTypes;

export default Navbar;
