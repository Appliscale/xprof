import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from '../../components';
import {
  functionClick,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
} from '../../actions/NavigationActions';
// import { getValue } from '../../selectors/NavigationSelectors';
import {
  getStatus,
  getQuery,
  getACfunctions,
  getACposition,
} from '../../selectors/CommonSelectors';

const NavContainer = props => <Navbar {...props} />;

const mapStateToProps = state => ({
  // status should be updated every each tick
  // backgroud procces which is listening endpoitn
  status: getStatus(state),
  // Click on TracingSwitch should toggle status
  // toggleTraceStatus: () => console.log(`toggleTraceStatus${state.toString()}`),
  // Control keys in input (autocompleter)
  // up/down should higlight given function
  // Tab should autocomplete
  // enter should take function from table an insert it in input and submit
  // handleKeyDown: () => console.log('handleKeyDown'),
  // Should update value
  // handleInputChange: () => console.log('handleInputChange'),
  // Value visible in query input
  // Can be inserted from table or just from handleInputChange
  query: getQuery(state),
  // list of functions for autocompleter
  functions: getACfunctions(state),
  // If clicked on function (full name) it will be in query input and submit
  // onFunctionClickedModal: () => console.log('onFunctionClickedModal'),
  // highlited functions in table
  position: getACposition(state),
});

export default connect(mapStateToProps, {
  functionClick,
  toggleTraceStatus,
  queryKeyDown,
  queryInputChange,
})(NavContainer);
