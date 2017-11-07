import React from 'react';
import { connect } from 'react-redux';
import { Root } from '../../components';

const RootContainer = () => <Root />;

const mapStateToProps = state => ({
  status: state,
});
export default connect(mapStateToProps)(RootContainer);
