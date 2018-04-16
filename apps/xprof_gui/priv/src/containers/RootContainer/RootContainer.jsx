import React from 'react';
import { connect } from 'react-redux';
import Root from '../../components/Root';
import { getTraceStatus, getMode } from '../../actions';

const RootContainer = props => <Root {...props} />;

const mapStateToProps = state => ({
  status: state,
});

const mapDispatchToProps = {
  getTraceStatus,
  getMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
