import React from 'react';
import PropTypes from 'prop-types';
import NavbarContainer from '../../containers/NavbarContainer/NavbarContainer';
import { STATUS_INTERVAL } from '../../constants';

const propTypes = {
  poolTraceStatus: PropTypes.func.isRequired,
};
class Root extends React.Component {
  componentWillMount() {
    const { poolTraceStatus } = this.props;
    setInterval(poolTraceStatus, STATUS_INTERVAL);
  }

  render() {
    return (
      <div className="container-fluid">
        <NavbarContainer />
      </div>
    );
  }
}

Root.propTypes = propTypes;

export default Root;
