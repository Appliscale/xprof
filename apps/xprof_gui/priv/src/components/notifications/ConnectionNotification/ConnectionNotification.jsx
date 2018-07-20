import PropTypes from 'prop-types';
import React from 'react';
import { NOTIFICATIONS } from '../../../constants';

const propTypes = {
  isConnection: PropTypes.bool.isRequired,
};

const ConnectionNotification = ({ isConnection }) => (
  <div className="flex justify-center fixed z-max w-100 mt7">
    <div
      className={`w-33 pa4 alert ${isConnection
        ? 'alert-success'
        : 'alert-danger'} ma2 shadow-5 tc f1`}
    >
      {isConnection
        ? NOTIFICATIONS.ALIVE_CONNECTION
        : NOTIFICATIONS.LOST_CONNECTION}
    </div>
  </div>
);

ConnectionNotification.propTypes = propTypes;

export default ConnectionNotification;
