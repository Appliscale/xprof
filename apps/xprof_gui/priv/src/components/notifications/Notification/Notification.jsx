import PropTypes from 'prop-types';
import React from 'react';
import { getAlertClass } from '../../../utils';

const propTypes = {
  severity: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
};

const Notification = ({ severity, message, remove }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={remove}
    onKeyPress={event => event.key === 'Enter' && remove()}
    className={`link alert ${getAlertClass(severity)} ma2 shadow-5 o-70 glow`}
  >
    {message}
  </div>
);

Notification.propTypes = propTypes;

export default Notification;
