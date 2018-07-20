import React from 'react';
import { connect } from 'react-redux';
import { Notifications } from '../../components/notifications';
import {
  getNotifications,
  isConnection,
  getConnectionsNotificationVisibility,
} from '../../selectors';
import { removeNotification } from '../../actions';

const NotiContainer = props => <Notifications {...props} />;

const mapStateToProps = state => ({
  notifications: getNotifications(state),
  isConnection: isConnection(state),
  showConnectionNotification: getConnectionsNotificationVisibility(state),
});

const mapDispatchToProps = {
  removeNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(NotiContainer);
