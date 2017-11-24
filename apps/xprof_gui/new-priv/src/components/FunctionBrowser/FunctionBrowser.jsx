import PropTypes from 'prop-types';
import React from 'react';
import { QueryInput, ACModal } from '../';

const defaultProps = {
  position: -1,
  showFavourites: false,
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  showFavourites: PropTypes.bool,
  setShowFavourites: PropTypes.func.isRequired,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const FunctionBrowser = ({
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
  <form className="navbar-form">
    <div className="form-group" style={{ display: 'inline' }}>
      <div className="input-group" style={{ display: 'table' }}>
        <div className="input-group-btn" style={{ width: '1%' }}>
          <button
            type="button"
            className={`btn btn-default ${showFavourites ? 'active' : ''}`}
            onClick={() => setShowFavourites(!showFavourites)}
          >
            <span className="glyphicon glyphicon-star" />
          </button>
          <button
            type="button"
            className={`btn btn-default ${!showFavourites ? 'active' : ''}`}
            onClick={() => setShowFavourites(!showFavourites)}
          >
            <span className="glyphicon glyphicon-search" />
          </button>
        </div>
        <QueryInput
          queryKeyDown={queryKeyDown}
          queryInputChange={queryInputChange}
          query={query}
          placeholder={placeholder}
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
