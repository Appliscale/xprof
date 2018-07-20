import PropTypes from 'prop-types';
import React from 'react';
import { CallsSwitch } from '../';
import { isIntegerInRange } from '../../../utils/CommonUtils';
import { THRESHOLD_LIMIT, CALLS_LIMIT } from '../../../constants';

const defaultProps = {
  threshold: '',
  limit: '',
  collecting: false,
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
      {/* <div className="form-group calles-nav">
        <div className="input-group">
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-no-margin">
              <li>
                <a href="/" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li>
                <a href="/">1</a>
              </li>
              <li>
                <a href="/">2</a>
              </li>
              <li>
                <a href="/">3</a>
              </li>
              <li>
                <a href="/">4</a>
              </li>
              <li>
                <a href="/">5</a>
              </li>
              <li>
                <a href="/" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div> */}
    </form>
  );
};

CallsInput.defaultProps = defaultProps;
CallsInput.propTypes = propTypes;

export default CallsInput;
