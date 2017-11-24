import PropTypes from 'prop-types';
import React from 'react';
import { FavouriteContainer } from '../../containers';

const defaultProps = {
  isHighlighted: false,
};

const propTypes = {
  functionClick: PropTypes.func.isRequired,
  functionName: PropTypes.string.isRequired,
  isHighlighted: PropTypes.bool,
};

const ACModalRow = ({ functionClick, functionName, isHighlighted }) => (
  <tr
    className={isHighlighted ? 'row-highlight' : ''}
    onClick={() => functionClick(functionName)}
  >
    <td>{functionName}
      <span className="pull-right">
        <FavouriteContainer functionName={functionName} />
      </span>
    </td>
  </tr>
);

ACModalRow.defaultProps = defaultProps;
ACModalRow.propTypes = propTypes;

export default ACModalRow;
