import React from 'react';
import PropTypes from 'prop-types';
import NavbarContainer from '../../containers/NavbarContainer/NavbarContainer';
import MonitoringContainer from '../../containers/MonitoringContainer/MonitoringContainer';
import { Footer } from '../';
import { STATUS_INTERVAL } from '../../constants';

const propTypes = {
  poolTraceStatus: PropTypes.func.isRequired,
};
class Root extends React.Component {
  componentWillMount() {
    const { poolTraceStatus } = this.props;
    poolTraceStatus();
    setInterval(poolTraceStatus, STATUS_INTERVAL);
  }

  render() {
    return (
      <div>
        <NavbarContainer />
        <MonitoringContainer />
        <Footer />
      </div>
    );
  }
}

Root.propTypes = propTypes;

export default Root;
