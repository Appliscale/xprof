import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { DATA_INTERVAL } from '../../../constants';
// import { getAssociatedID } from '../../../utils';
import { safecomposeID } from '../../../utils';

const defaultProps = {
  panelVisibility: true,
  data: [],
  callees: [],
  calleesVisibility: false,
  // IDs: {},
  size: {
    width: 0,
    height: 0,
    marginTop: 20,
    marginRight: 0,
    marginBottom: 70,
    marginLeft: 0,
  },
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  getFunctionsData: PropTypes.func.isRequired,
  // setIDs: PropTypes.func.isRequired,
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
  // IDs: PropTypes.shape(PropTypes.shape(PropTypes.any)),
  setSize: PropTypes.func.isRequired,
  size: PropTypes.shape(PropTypes.any),
};

class Monitoring extends React.Component {
  componentWillMount() {
    const { getFunctionsData /* , setIDs */ } = this.props;
    getFunctionsData();
    // setIDs();
    this.dataInterval = setInterval(getFunctionsData, DATA_INTERVAL);
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
      // IDs,
      setSize,
      size,
    } = this.props;
    // const associatedID = getAssociatedID(IDs, monitored.query);
    const monitoredID = safecomposeID(monitored.query);
    console.log(monitoredID, monitored.query);
    if (monitoredID) {
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
            monitoredID={monitoredID}
            setSize={setSize}
            size={size}
          />
        </div>
      );
    }
    return null;
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
