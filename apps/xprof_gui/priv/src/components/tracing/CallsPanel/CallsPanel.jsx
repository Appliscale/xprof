import PropTypes from 'prop-types';
import React from 'react';
import { CallsTable, CallsInput, CallsUtilsButtons } from '../';

const defaultProps = {
  lastCalls: {},
  panelVisibility: false,
};

const propTypes = {
  lastCalls: PropTypes.objectOf(PropTypes.any),
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  sortCallsBy: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  control: PropTypes.objectOf(PropTypes.any).isRequired,
  panelVisibility: PropTypes.bool,
  expand: PropTypes.func.isRequired,
  shrink: PropTypes.func.isRequired,
};

const CallsPanel = ({
  lastCalls,
  handleThresholdChange,
  handleLimitChange,
  toggleCallsTracing,
  mfa,
  sortCallsBy,
  toggleExpandItem,
  control,
  panelVisibility,
  expand,
  shrink,
}) => (
  <div className="panel panel-default">
    <div className="panel-heading">
      <CallsUtilsButtons
        panelVisibility={panelVisibility}
        expand={() => expand(mfa[3])}
        shrink={() => shrink(mfa[3])}
      />
      <h3 className="panel-title">
        {mfa[3]}
        <span className="panel-subtitle"> - Slow calls tracing</span>
      </h3>
    </div>
    {panelVisibility ? (
      <div className="panel-body">
        <CallsInput
          mfa={mfa}
          collecting={control.collecting}
          threshold={control.threshold}
          handleThresholdChange={handleThresholdChange}
          limit={control.limit}
          handleLimitChange={handleLimitChange}
          toggleCallsTracing={toggleCallsTracing}
        />
      </div>
    ) : null}
    {panelVisibility ? (
      <CallsTable
        mfa={mfa}
        sort={lastCalls.sort}
        sortCallsBy={sortCallsBy}
        toggleExpandItem={toggleExpandItem}
      />
    ) : null}
  </div>
);

CallsPanel.defaultProps = defaultProps;
CallsPanel.propTypes = propTypes;

export default CallsPanel;
