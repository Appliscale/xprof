import PropTypes from 'prop-types';
import React from 'react';
import { CallsSwitch } from '../';
import { Pagination } from '../../shared';
import { isIntegerInRange } from '../../../utils/CommonUtils';
import { THRESHOLD_LIMIT, CALLS_LIMIT } from '../../../constants';

const defaultProps = {
  threshold: '',
  limit: '',
  collecting: false,
  currentCallsPage: 1,
};

const propTypes = {
  monitored: PropTypes.shape({
    graph_type: PropTypes.string,
    mfa: PropTypes.arrayOf(PropTypes.any),
    query: PropTypes.string,
  }).isRequired,
  threshold: PropTypes.string,
  handleThresholdChange: PropTypes.func.isRequired,
  limit: PropTypes.string,
  handleLimitChange: PropTypes.func.isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  collecting: PropTypes.bool,
  isConnection: PropTypes.bool.isRequired,
  currentCallsPage: PropTypes.number,
  countCallsPages: PropTypes.number.isRequired,
  startCallsPage: PropTypes.number.isRequired,
  nextCallsPagination: PropTypes.func.isRequired,
  previousCallsPagination: PropTypes.func.isRequired,
  setCallsPage: PropTypes.func.isRequired,
};

const CallsInput = ({
  monitored,
  threshold,
  handleThresholdChange,
  limit,
  handleLimitChange,
  toggleCallsTracing,
  collecting,
  isConnection,
  currentCallsPage,
  countCallsPages,
  startCallsPage,
  nextCallsPagination,
  previousCallsPagination,
  setCallsPage,
}) => {
  let thresholdClass;
  let limitClass;
  let error;

  if (!limit || !threshold) {
    error = true;
  } else {
    if (threshold && !isIntegerInRange(threshold, 0, THRESHOLD_LIMIT)) {
      thresholdClass = 'has-error';
      error = true;
    }
    if (limit && !isIntegerInRange(limit, 1, CALLS_LIMIT)) {
      limitClass = 'has-error';
      error = true;
    }
  }

  return (
    <form className="form-inline">
      <div className="form-group">
        <div className="input-group">
          <div className="input-group-addon">Treshold</div>
          <span className={thresholdClass}>
            <input
              type="text"
              className="form-control"
              placeholder={`0 - ${THRESHOLD_LIMIT}`}
              value={threshold}
              onChange={e => handleThresholdChange(monitored, e.target.value)}
              disabled={collecting}
            />
          </span>
          <div className="input-group-addon">ms</div>
        </div>
      </div>
      <span />
      <div className="form-group">
        <div className="input-group">
          <div className="input-group-addon">Limit</div>
          <span className={limitClass}>
            <input
              type="text"
              className="form-control"
              placeholder={`1 - ${CALLS_LIMIT}`}
              value={limit}
              onChange={e => handleLimitChange(monitored, e.target.value)}
              disabled={collecting}
            />
          </span>
          <div className="input-group-addon">calls</div>
        </div>
      </div>
      <span>
        {error}
        <CallsSwitch
          monitored={monitored}
          disabled={error || !isConnection}
          collecting={collecting}
          toggleCallsTracing={toggleCallsTracing}
        />
      </span>
      {countCallsPages > 1 && (
        <Pagination
          current={currentCallsPage}
          count={countCallsPages}
          start={startCallsPage}
          onClickNext={() => nextCallsPagination(monitored.query)}
          onClickPrevious={() => previousCallsPagination(monitored.query)}
          onChange={nr => setCallsPage(monitored.query, nr)}
        />
      )}
    </form>
  );
};

CallsInput.defaultProps = defaultProps;
CallsInput.propTypes = propTypes;

export default CallsInput;
