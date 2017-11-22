import PropTypes from 'prop-types';
import React from 'react';
import CallsTable from '../CallsTable/CallsTable';
import CallsInput from '../CallsInput/CallsInput';

const defaultProps = {
  lastCapture: {},
  sortBy: () => console.log(''),
};
const propTypes = {
  lastCapture: PropTypes.objectOf(PropTypes.any),
  handleThresholdChange: PropTypes.func.isRequired,
  handleLimitChange: PropTypes.func.isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  sortBy: PropTypes.func,
  toggleExpandItem: PropTypes.func.isRequired,
  control: PropTypes.objectOf(PropTypes.any).isRequired,
};

const CallsPanel = ({
  lastCapture,
  handleThresholdChange,
  handleLimitChange,
  toggleCallsTracing,
  mfa,
  sortBy,
  toggleExpandItem,
  control,
}) => (
  <div className="panel panel-default">
    <div className="panel-heading">Slow calls tracing</div>
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
    <CallsTable
      mfa={mfa}
      items={lastCapture.items}
      sortBy={sortBy}
      toggleExpandItem={toggleExpandItem}
    />
  </div>
);

CallsPanel.defaultProps = defaultProps;
CallsPanel.propTypes = propTypes;

export default CallsPanel;
