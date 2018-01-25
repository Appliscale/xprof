import PropTypes from 'prop-types';
import React from 'react';
import CallsSwitch from '../CallsSwitch/CallsSwitch';
import { isIntegerInRange } from '../../utils/CommonUtils';
import { THRESHOLD_LIMIT, CALLS_LIMIT } from '../../constants';

const defaultProps = {
  threshold: '',
  limit: '',
  collecting: false,
};

const propTypes = {
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
  threshold: PropTypes.string,
  handleThresholdChange: PropTypes.func.isRequired,
  limit: PropTypes.string,
  handleLimitChange: PropTypes.func.isRequired,
  toggleCallsTracing: PropTypes.func.isRequired,
  collecting: PropTypes.bool,
};

const CallsInput = ({
  mfa,
  threshold,
  handleThresholdChange,
  limit,
  handleLimitChange,
  toggleCallsTracing,
  collecting,
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
              onChange={e => handleThresholdChange(mfa, e.target.value)}
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
              onChange={e => handleLimitChange(mfa, e.target.value)}
              disabled={collecting}
            />
          </span>
          <div className="input-group-addon">calls</div>
        </div>
      </div>
      <span>
        {error}
        <CallsSwitch
          mfa={mfa}
          disabled={error}
          collecting={collecting}
          toggleCallsTracing={toggleCallsTracing}
        />
      </span>
    </form>
  );
};

CallsInput.defaultProps = defaultProps;
CallsInput.propTypes = propTypes;

export default CallsInput;
