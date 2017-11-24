import React from 'react';
import { connect } from 'react-redux';
import { FavouriteButton } from '../../components';
import { toggleFavourite } from '../../actions/FavouritesActions';
import { getFavourites } from '../../selectors/CommonSelectors';

const FavouriteContainer = props => <FavouriteButton {...props} />;

const mapStateToProps = (state, ownProps) => ({
  isFavourite: getFavourites(state).includes(ownProps.functionName),
  functionName: ownProps.functionName,
});

const mapDispatchToProps = {
  toggleFavourite,
};

export default connect(mapStateToProps, mapDispatchToProps)(FavouriteContainer);
