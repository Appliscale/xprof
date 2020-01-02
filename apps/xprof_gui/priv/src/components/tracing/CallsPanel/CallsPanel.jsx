import PropTypes from 'prop-types';
import React from 'react';
import { CallsTable, CallsInput, CallsUtilsButtons } from '../';

const defaultProps = {
  currentCalls: {},
  panelVisibility: false,
  currentCallsPage: 1,
};

const propTypes = {
  currentCalls: PropTypes.objectOf(PropTypes.any),
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  sortCallsBy: PropTypes.func.isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  control: PropTypes.objectOf(PropTypes.any).isRequired,
  panelVisibility: PropTypes.bool,
  expand: PropTypes.func.isRequired,
  shrink: PropTypes.func.isRequired,
  isConnection: PropTypes.bool.isRequired,
  currentCallsPage: PropTypes.number,
  countCallsPages: PropTypes.number.isRequired,
  startCallsPage: PropTypes.number.isRequired,
  nextCallsPagination: PropTypes.func.isRequired,
  previousCallsPagination: PropTypes.func.isRequired,
  setCallsPage: PropTypes.func.isRequired,
};

const CallsPanel = ({
  currentCalls,
  handleThresholdChange,
  handleLimitChange,
  toggleCallsTracing,
  monitored,
  sortCallsBy,
  toggleExpandItem,
  control,
  panelVisibility,
  expand,
  shrink,
  isConnection,
  currentCallsPage,
  countCallsPages,
  startCallsPage,
  nextCallsPagination,
  previousCallsPagination,
  setCallsPage,
}) => (
  <div className="panel panel-default">
    <div className="panel-heading">
      <CallsUtilsButtons
        panelVisibility={panelVisibility}
        expand={() => expand(monitored.query)}
        shrink={() => shrink(monitored.query)}
      />
      <h3 className="panel-title">
        {monitored.query}
        <span className="panel-subtitle"> - Slow calls tracing</span>
      </h3>
    </div>
    {panelVisibility ? (
      <div className="panel-body">
        <CallsInput
          monitored={monitored}
          collecting={control.collecting}
          threshold={control.threshold}
          handleThresholdChange={handleThresholdChange}
          limit={control.limit}
          handleLimitChange={handleLimitChange}
          toggleCallsTracing={toggleCallsTracing}
          isConnection={isConnection}
          currentCallsPage={currentCallsPage}
          countCallsPages={countCallsPages}
          startCallsPage={startCallsPage}
          nextCallsPagination={nextCallsPagination}
          previousCallsPagination={previousCallsPagination}
          setCallsPage={setCallsPage}
        />
      </div>
    ) : null}
    {panelVisibility ? (
      <CallsTable
        monitored={monitored}
        sort={currentCalls.sort}
        sortCallsBy={sortCallsBy}
        toggleExpandItem={toggleExpandItem}
      />
    ) : null}
  </div>
);

CallsPanel.defaultProps = defaultProps;
CallsPanel.propTypes = propTypes;

export default CallsPanel;
