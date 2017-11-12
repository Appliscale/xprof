import PropTypes from 'prop-types';
import React from 'react';

const defaultProps = {
  isHighlighted: false,
};

const propTypes = {
  functionClick: PropTypes.func.isRequired,
  functionName: PropTypes.string.isRequired,
  isHighlighted: PropTypes.bool,
};

class ACModalRow extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { functionName, functionClick } = this.props;
    functionClick(functionName);
  }

  render() {
    const { functionName, isHighlighted } = this.props;
    return (
      <tr className={isHighlighted ? 'row-highlight' : ''} onClick={this.onClick}>
        <td>{functionName}</td>
      </tr>
    );
  }
}

ACModalRow.defaultProps = defaultProps;
ACModalRow.propTypes = propTypes;

export default ACModalRow;
