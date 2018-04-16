import PropTypes from 'prop-types';
import React from 'react';
import { HANDLED_KEY_CODES } from '../../constants';

const defaultProps = {
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
  error: false,
};

const propTypes = {
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
};

class QueryInput extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onKeyDown(e) {
    const { queryKeyDown } = this.props;
    if (HANDLED_KEY_CODES.includes(e.keyCode)) {
      e.preventDefault();
      queryKeyDown(e.keyCode);
    }
  }

  onChange(e) {
    const { queryInputChange } = this.props;
    queryInputChange(e.target.value);
  }

  render() {
    const { query } = this.props;
    let errorClass = '';
    let { placeholder } = this.props;

    if (this.props.error) {
      errorClass = 'is-invalid';
      placeholder = 'No such function!';
    }

    return (
      <div>
        <input
          id="searchBox"
          type="text"
          className={`${errorClass} form-control`}
          placeholder={placeholder}
          aria-describedby="sizing-addon3"
          autoComplete="off"
          value={query}
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
