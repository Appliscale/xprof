import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import ACModalRow from '../';
import { MAX_FUNCTIONS_AUTOCOMPLETER } from '../../constants';

const defaultProps = {
  position: -1,
};

const propTypes = {
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFunctionSelected: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const ACModal = ({ functions, onFunctionSelected, position }) => {
  const funs = _.take(functions, MAX_FUNCTIONS_AUTOCOMPLETER);
  return (
    <div className="panel panel-default suggestions-panel">
      <table className="table table-striped">
        <tbody>
          {funs.map((fun, index) => (
            <ACModalRow
              key={fun}
              onFunctionSelected={onFunctionSelected}
              functionName={fun}
              isHighlighted={index === position}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

ACModal.defaultProps = defaultProps;
ACModal.propTypes = propTypes;

export default ACModal;
