import PropTypes from 'prop-types';
import React from 'react';
import { take } from 'lodash';
import { ACModalRow } from '../';
import * as contants from '../../constants';

const defaultProps = {
  position: -1,
};

const propTypes = {
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  functionClick: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const ACModal = ({ functions, functionClick, position }) => {
  const funs = take(functions, contants.MAX_FUNCTIONS_AUTOCOMPLETER);
  return (
    <div className="suggestions-panel-parent">
      {funs.length ? (
        <div className="panel panel-default suggestions-panel">
          <table className="table table-striped">
            <tbody>
              {funs.map((fun, index) => (
                <ACModalRow
                  key={fun}
                  functionClick={functionClick}
                  functionName={fun}
                  isHighlighted={index === position}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

ACModal.defaultProps = defaultProps;
ACModal.propTypes = propTypes;

export default ACModal;
