import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from '../../components';

const NavContainer = props => <Navbar {...props} />;

const mapStateToProps = state => ({
  status: 'running',
  toggleTraceStatus: () => console.log(`toggleTraceStatus${state.toString()}`),
  handleKeyDown: () => console.log('handleKeyDown'),
  handleInputChange: () => console.log('handleInputChange'),
  value: '',
  functions: ['f1', 'f2'],
  onFunctionClickedModal: () => console.log('onFunctionClickedModal'),
  position: 1,
});

export default connect(mapStateToProps)(NavContainer);
