import React from 'react';
import { connect } from 'react-redux';
import Functions from '../../components/functions';
import { getMonitoredFunctions } from '../../actions';
import { getAllMonitored } from '../../selectors';

const FunctionsContainer = props => <Functions {...props} />;

const mapStateToProps = state => ({
  monitoredCollection: getAllMonitored(state),
});

const mapDispatchToProps = {
  getMonitoredFunctions,
};

const con = connect(mapStateToProps, mapDispatchToProps)(FunctionsContainer);
export default con;
