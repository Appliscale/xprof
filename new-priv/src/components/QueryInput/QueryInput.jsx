import PropTypes from 'prop-types';
import React from 'react';
import { HANDLED_KEY_CODES } from '../../constants';

const defaultProps = {
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  handleKeyDown: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

class QueryInput extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onKeyDown(e) {
    const { handleKeyDown } = this.props;
    if (HANDLED_KEY_CODES.includes(e.keyCode)) {
      e.preventDefault();
      handleKeyDown(e.keyCode);
    }
  }

  onChange(e) {
    const { handleInputChange } = this.props;
    handleInputChange(e.target.value);
  }

  render() {
    const { value, placeholder } = this.props;
    return (
      <div>
        <input
          id="searchBox"
          type="text"
          className="form-control"
          placeholder={placeholder}
          aria-describedby="sizing-addon3"
          autoComplete="off"
          value={value}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

QueryInput.defaultProps = defaultProps;
QueryInput.propTypes = propTypes;

export default QueryInput;
