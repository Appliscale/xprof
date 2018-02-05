import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from '../../components/navigation';
import {
  functionClick,
  queryKeyDown,
  queryInputChange,
  toggleTraceStatus,
  setPositionOnFunction,
} from '../../actions';
import {
  getStatus,
  getQuery,
  getACfunctions,
  getACposition,
} from '../../selectors';

const NavContainer = props => <Navbar {...props} />;

const mapStateToProps = state => ({
  status: getStatus(state),
  query: getQuery(state),
  functions: getACfunctions(state),
  position: getACposition(state),
});

const mapDispatchToProps = {
  functionClick,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
  setPositionOnFunction,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavContainer);
