import React from 'react';
import PropTypes from 'prop-types';
import {
  prepareTooltip,
  compose,
  updateSize,
  update,
  executeIfExists,
  expandGrid,
} from '../../../utils';

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
    prepareTooltip();
  }

  componentDidMount() {
    compose(this.props);
  }

  componentWillReceiveProps(nextProps) {
    expandGrid(this.props, nextProps);
  }

  componentWillUpdate() {
    const { graphID } = this.props;
    executeIfExists(
      document.getElementById(`grid-${graphID}`),
      update,
      this.props,
    );
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions() {
    const { setSize, graphID } = this.props;
    /*
      By setting the timeout we are sure that the window
      is settled after resizing - this is important in
      case of a very rapid resizing. We have to catch the
      wrapper size a few miliseconds later.
    */
    setTimeout(() => updateSize(setSize, graphID), 500);
  }

  render() {
    const { graphID, size } = this.props;
    return (
      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'inline-block' }}>
          <div
            id={`y-${graphID}`}
            style={{
              display: 'inline-block',
              marginRight: 7, // the little space between bar-axis and the grid
            }}
          />
          <div id={`grid-${graphID}`} style={{ display: 'inline-block' }} />
        </div>
        <div
          id={`x-${graphID}`}
          style={{
            height: size.marginBottom,
            width: size.width,
            marginLeft: size.marginLeft + 7,
          }}
        />
      </div>
    );
  }
}

Grid.propTypes = {
  // data: PropTypes.arrayOf(PropTypes.shape(PropTypes.any)).isRequired,
  size: PropTypes.shape(PropTypes.any).isRequired,
  graphID: PropTypes.string.isRequired,
  setSize: PropTypes.func.isRequired,
};

export default Grid;
