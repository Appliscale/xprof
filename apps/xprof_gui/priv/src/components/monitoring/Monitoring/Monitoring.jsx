import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { DATA_INTERVAL } from '../../../constants';

function roll(func) {
  const r = Math.trunc(Math.random() * 100);
  if (document.getElementById(`grid-${r}`)) {
    func();
  }
  return r;
}

const defaultProps = {
  panelVisibility: true,
  data: [],
  callees: [],
  calleesVisibility: false,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  stopMonitoringFunction: PropTypes.func.isRequired,
  callees: PropTypes.arrayOf(PropTypes.string),
  calleesVisibility: PropTypes.bool,
  showCallees: PropTypes.func.isRequired,
  hideCallees: PropTypes.func.isRequired,
  panelVisibility: PropTypes.bool,
  expandGraphPanel: PropTypes.func.isRequired,
  shrinkGraphPanel: PropTypes.func.isRequired,
  calleeClick: PropTypes.func.isRequired,
};

class Monitoring extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passId: 0,
    };
  }

  componentWillMount() {
    const { getFunctionsData } = this.props;
    getFunctionsData();
    this.dataInterval = setInterval(getFunctionsData, DATA_INTERVAL);
    /*
        passId is a random number from the range 0-100;
        as the D3 is working on the whole document context,
        literally every graph element should have a unique ID
        (if not, the animation will be passed only to the lastly invoked);
        we could pass the MFA as the ID suffix but when we iterate over
        huge dataset of rectangles and every of them is referenced by ID,
        we have to find a shorter suffix - so instead of passing
        long function names, we are passing a random number (but checking if
        is it unique number for the whole document; we are securing ourselves by
        setting the range to 0-100 - the user will be unable to open 100 graphs
        at once)
    */
    this.setState({ passId: roll(roll) });
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
    clearInterval(this.dataInterval);
  }

  render() {
    const {
      monitored,
      data,
      stopMonitoringFunction,
      callees,
      calleesVisibility,
      showCallees,
      hideCallees,
      panelVisibility,
      expandGraphPanel,
      shrinkGraphPanel,
      calleeClick,
    } = this.props;
    const { passId } = this.state;
    return (
      <div>
        <GraphPanel
          key={monitored.query}
          monitored={monitored}
          dps={data}
          stopMonitoringFunction={stopMonitoringFunction}
          callees={callees}
          calleesVisibility={calleesVisibility}
          showCallees={showCallees}
          hideCallees={hideCallees}
          panelVisibility={panelVisibility}
          expand={expandGraphPanel}
          shrink={shrinkGraphPanel}
          calleeClick={calleeClick}
          passId={passId}
        />
      </div>
    );
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
