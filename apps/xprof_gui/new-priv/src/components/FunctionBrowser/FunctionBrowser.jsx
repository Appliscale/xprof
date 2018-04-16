import PropTypes from 'prop-types';
import React from 'react';
import { QueryInput, ACModal } from '../';

const defaultProps = {
  position: -1,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
  error: false,
};

const propTypes = {
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
  error: PropTypes.bool,
};

const FunctionBrowser = ({
  queryKeyDown,
  queryInputChange,
  query,
  placeholder,
  functions,
  functionClick,
  position,
  error,
}) => (
  <form className="navbar-form">
    <div className="form-group" style={{ display: 'inline' }}>
      <div className="input-group" style={{ display: 'table' }}>
        <span className="input-group-addon" style={{ width: '1%' }}>
          <span className="glyphicon glyphicon-search" />
        </span>
        <QueryInput
          queryKeyDown={queryKeyDown}
          queryInputChange={queryInputChange}
          query={query}
          placeholder={placeholder}
          error={error}
        />
        <ACModal
          functions={functions}
          functionClick={functionClick}
          position={position}
        />
      </div>
    </div>
  </form>
);

FunctionBrowser.defaultProps = defaultProps;
FunctionBrowser.propTypes = propTypes;

export default FunctionBrowser;
