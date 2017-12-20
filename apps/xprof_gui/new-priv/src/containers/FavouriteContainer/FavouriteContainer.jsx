import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FavouriteButton } from '../../components';
import { toggleFavourite } from '../../actions/FavouritesActions';
import {
  getFavourites,
  getFavouritesEnabled,
} from '../../selectors/CommonSelectors';

const FavouriteContainer = props =>
  (props.favouritesEnabled ? <FavouriteButton {...props} /> : '');

FavouriteContainer.propTypes = {
  favouritesEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  isFavourite: getFavourites(state).includes(ownProps.functionName),
  favouritesEnabled: getFavouritesEnabled(state),
  functionName: ownProps.functionName,
});

const mapDispatchToProps = {
  toggleFavourite,
};

export default connect(mapStateToProps, mapDispatchToProps)(FavouriteContainer);
