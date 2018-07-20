import React from 'react';
import PropTypes from 'prop-types';
import {
  NavbarContainer,
  FunctionsContainer,
  NotificationContainer,
} from '../../containers';
import { Footer } from '../navigation';
import { STATUS_INTERVAL } from '../../constants';

const propTypes = {
  getTraceStatus: PropTypes.func.isRequired,
  getMode: PropTypes.func.isRequired,
};
class Root extends React.Component {
  componentWillMount() {
    const { getTraceStatus, getMode } = this.props;
    getMode();
    getTraceStatus();
    setInterval(getTraceStatus, STATUS_INTERVAL);
  }

  render() {
    return (
      <div>
        <NotificationContainer />
        <NavbarContainer />
        <FunctionsContainer />
        <Footer />
      </div>
    );
  }
}

Root.propTypes = propTypes;

export default Root;
