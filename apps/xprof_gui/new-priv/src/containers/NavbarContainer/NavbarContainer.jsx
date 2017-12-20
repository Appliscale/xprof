import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from '../../components';
import {
  functionClick,
  queryKeyDown,
  queryInputChange,
  setShowFavourites,
} from '../../actions/NavigationActions';
import { toggleTraceStatus } from '../../actions/StatusActions';
// import { getValue } from '../../selectors/NavigationSelectors';
import {
  getStatus,
  getQuery,
  getACfunctions,
  getACposition,
  getShowFavourites,
  getFavouritesEnabled,
} from '../../selectors/CommonSelectors';

const NavContainer = props => <Navbar {...props} />;

const mapStateToProps = state => ({
  status: getStatus(state),
  query: getQuery(state),
  favouritesEnabled: getFavouritesEnabled(state),
  showFavourites: getShowFavourites(state),
  functions: getACfunctions(state),
  position: getACposition(state),
});

const mapDispatchToProps = {
  functionClick,
  toggleTraceStatus,
  setShowFavourites,
  queryKeyDown,
  queryInputChange,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavContainer);
