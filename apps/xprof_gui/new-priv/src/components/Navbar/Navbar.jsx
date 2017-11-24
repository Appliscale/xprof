import PropTypes from 'prop-types';
import React from 'react';
import { FunctionBrowser, TracingSwitch } from '../';
import logo from './logo.png';

const defaultProps = {
  position: -1,
  showFavourites: false,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  status: PropTypes.string.isRequired,
  toggleTraceStatus: PropTypes.func.isRequired,
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  showFavourites: PropTypes.bool,
  setShowFavourites: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const Navbar = ({
  status,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
  query,
  showFavourites,
  setShowFavourites,
  placeholder,
  functions,
  functionClick,
  position,
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
        showFavourites={showFavourites}
        setShowFavourites={setShowFavourites}
        placeholder={placeholder}
        functions={functions}
        functionClick={functionClick}
        position={position}
      />
    </div>
  </nav>
);

Navbar.defaultProps = defaultProps;
Navbar.propTypes = propTypes;

export default Navbar;
