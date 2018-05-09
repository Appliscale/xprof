import React from 'react';
import PropTypes from 'prop-types';
import { GraphPanel } from '../';
import { DATA_INTERVAL } from '../../../constants';

const defaultProps = {
  panelVisibility: true,
  data: [],
  callees: [],
  calleesVisibility: false,
};

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
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
  running: PropTypes.bool.isRequired,
};

class Monitoring extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snapshot: null,
    };
  }

  componentWillMount() {
    const { getFunctionsData, data } = this.props;
    getFunctionsData();
    this.dataInterval = setInterval(getFunctionsData, DATA_INTERVAL);
    this.setState({ snapshot: data });
  }

  componentWillReceiveProps(nextProps) {
    const { running, data } = this.props;
    if (nextProps.running !== running && running === true) {
      this.setState({ snapshot: data });
    }
  }

  componentWillUnmount() {
    clearInterval(this.functionInterval);
    clearInterval(this.dataInterval);
  }

  render() {
    const {
      mfa,
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
      running,
    } = this.props;
    const { snapshot } = this.state;
    return (
      <div>
        <GraphPanel
          key={mfa[3]}
          mfa={mfa}
          dps={running ? data : snapshot}
          stopMonitoringFunction={stopMonitoringFunction}
          callees={callees}
          calleesVisibility={calleesVisibility}
          showCallees={showCallees}
          hideCallees={hideCallees}
          panelVisibility={panelVisibility}
          expand={expandGraphPanel}
          shrink={shrinkGraphPanel}
          calleeClick={calleeClick}
        />
      </div>
    );
  }
}

Monitoring.defaultProps = defaultProps;
Monitoring.propTypes = propTypes;

export default Monitoring;
