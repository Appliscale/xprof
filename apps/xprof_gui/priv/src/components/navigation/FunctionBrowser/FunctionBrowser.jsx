import PropTypes from 'prop-types';
import React from 'react';
import { QueryInput, ACModal, InputSwitch } from '../';
import { INPUT_TYPE } from '../../../constants';

const defaultProps = {
  position: -1,
  placeholder: '',
  selectedInputType: INPUT_TYPE.SEARCH,
};

const propTypes = {
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  functions: PropTypes.arrayOf(PropTypes.object).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
  setPositionOnFunction: PropTypes.func.isRequired,
  isConnection: PropTypes.bool.isRequired,
  selectedInputType: PropTypes.string,
  switchInputType: PropTypes.func.isRequired,
};

const FunctionBrowser = ({
  queryKeyDown,
  queryInputChange,
  query,
  placeholder,
  functions,
  functionClick,
  position,
  setPositionOnFunction,
  isConnection,
  selectedInputType,
  switchInputType,
}) => (
  <form className="navbar-form">
    <div className="form-group" style={{ display: 'inline' }}>
      <div className="input-group" style={{ display: 'table' }}>
        <InputSwitch selected={selectedInputType} onChange={switchInputType} />
        <QueryInput
          queryKeyDown={queryKeyDown}
          queryInputChange={queryInputChange}
          query={query}
          placeholder={placeholder}
          isConnection={isConnection}
        />
        <ACModal
          functions={functions}
          functionClick={functionClick}
          position={position}
          setPositionOnFunction={setPositionOnFunction}
        />
      </div>
    </div>
  </form>
);

FunctionBrowser.defaultProps = defaultProps;
FunctionBrowser.propTypes = propTypes;

export default FunctionBrowser;
