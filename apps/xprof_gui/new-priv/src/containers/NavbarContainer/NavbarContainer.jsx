import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from '../../components';
import {
  functionClick,
  queryKeyDown,
  queryInputChange,
} from '../../actions/NavigationActions';
import { toggleTraceStatus } from '../../actions/StatusActions';
// import { getValue } from '../../selectors/NavigationSelectors';
import {
  getStatus,
  getQuery,
  getACfunctions,
  getACposition,
  getError,
} from '../../selectors/CommonSelectors';

const NavContainer = props => <Navbar {...props} />;

const mapStateToProps = state => ({
  status: getStatus(state),
  query: getQuery(state),
  functions: getACfunctions(state),
  position: getACposition(state),
  error: getError(state),
});

const mapDispatchToProps = {
  functionClick,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavContainer);
