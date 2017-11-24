import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  functionName: PropTypes.string.isRequired,
  isFavourite: PropTypes.bool,
  toggleFavourite: PropTypes.func.isRequired,
};

const defaultProps = {
  isFavourite: false,
};

const FavouriteButton = ({ functionName, isFavourite, toggleFavourite }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      toggleFavourite(functionName, !isFavourite);
    }}
    className={`text-warning glyphicon icon-button ${isFavourite
      ? 'glyphicon-star'
      : 'glyphicon-star-empty'}`}
  />
);

FavouriteButton.propTypes = propTypes;
FavouriteButton.defaultProps = defaultProps;

export default FavouriteButton;
