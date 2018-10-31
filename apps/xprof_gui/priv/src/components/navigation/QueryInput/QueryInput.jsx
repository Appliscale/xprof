import PropTypes from 'prop-types';
import React from 'react';
import { HANDLED_KEY_CODES } from '../../../constants';

const defaultProps = {
  placeholder: 'Hello BEAMer! Please specify your trace pattern here.',
};

const propTypes = {
  queryKeyDown: PropTypes.func.isRequired,
  queryInputChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  isConnection: PropTypes.bool.isRequired,
};

class QueryInput extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.searchBox = null;
    this.setSearchBoxRef = (element) => {
      this.searchBox = element;
    };
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
    const { query, placeholder, isConnection } = this.props;
    return (
      <div>
        <input
          id="searchBox"
          type="text"
          className="form-control navbar-search-border-right-input"
          placeholder={placeholder}
          aria-describedby="sizing-addon3"
          autoComplete="off"
          value={query}
          onClick={
            document.activeElement !== this.searchBox ? this.onChange : null
          }
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={!isConnection}
          ref={this.setSearchBoxRef}
        />
      </div>
    );
  }
}

QueryInput.defaultProps = defaultProps;
QueryInput.propTypes = propTypes;

export default QueryInput;
