import PropTypes from 'prop-types';
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Notification, ConnectionNotification } from '../';

const defaultProps = {
  notifications: [],
};

const propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    severity: PropTypes.string,
    message: PropTypes.string,
  })),
  removeNotification: PropTypes.func.isRequired,
  showConnectionNotification: PropTypes.bool.isRequired,
  isConnection: PropTypes.bool.isRequired,
};

const Notifications = ({
  notifications,
  removeNotification,
  showConnectionNotification,
  isConnection,
}) => (
  <div>
    <TransitionGroup>
      {showConnectionNotification && (
        <CSSTransition key="connection" timeout={200} classNames="notification">
          <ConnectionNotification isConnection={isConnection} />
        </CSSTransition>
      )}
    </TransitionGroup>

    <div
      className="fixed bottom-1 right-1 z-max"
      style={{ marginBottom: '30px' }}
    >
      <TransitionGroup>
        {notifications.length
          ? notifications.map(notification => (
            <CSSTransition
              key={notification.id}
              timeout={200}
              classNames="notification"
            >
              <Notification
                key={notification.id}
                severity={notification.severity}
                message={notification.message}
                remove={() => removeNotification(notification.id)}
              />
            </CSSTransition>
            ))
          : null}
      </TransitionGroup>
    </div>
  </div>
);

Notifications.defaultProps = defaultProps;
Notifications.propTypes = propTypes;

export default Notifications;
