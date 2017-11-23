import React from 'react';
import { connect } from 'react-redux';
import { Root } from '../../components';
import { poolTraceStatus } from '../../actions/StatusActions';

const RootContainer = props => <Root {...props} />;

const mapStateToProps = state => ({
  status: state,
});

const mapDispatchToProps = {
  poolTraceStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
