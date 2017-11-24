import React from 'react';
import { connect } from 'react-redux';
import { Root } from '../../components';
import { poolTraceStatus } from '../../actions/StatusActions';
import { fetchFavourites } from '../../actions/FavouritesActions';

const RootContainer = props => <Root {...props} />;

const mapStateToProps = state => ({
  status: state,
});

const mapDispatchToProps = {
  poolTraceStatus,
  fetchFavourites,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
