import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    call_time: PropTypes.number,
    pid: PropTypes.string,
    args: PropTypes.string,
    res: PropTypes.string,
    expanded: PropTypes.bool,
  }).isRequired,
  toggleExpandItem: PropTypes.func.isRequired,
  mfa: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const CallsRow = ({ mfa, item, toggleExpandItem }) => {
  const dir = item.expanded ? 'down' : 'right';
  const rowType = item.expanded ? 'expanded' : 'normal';

  return (
    <tr data-expanded={item.expanded} className={`row-${rowType}`}>
      <td>
        <button
          onClick={() => toggleExpandItem(mfa, item)}
          type="button"
          className="btn btn-default"
        >
          <span
            className={`expand-chevron glyphicon glyphicon-chevron-${dir}`}
            aria-hidden="true"
          />
        </button>
      </td>
      <td>{item.id}</td>
      <td>{item.call_time} &micro;s</td>
      <td>{item.pid}</td>
      <td style={{ maxWidth: '500px' }}>
        <div className="code-longbox" style={{ margin: 0 }}>
          {item.args}
        </div>
      </td>
      <td style={{ maxWidth: '500px' }}>
        <div className="code-longbox" style={{ margin: 0 }}>
          {item.res}
        </div>
      </td>
    </tr>
  );
};

CallsRow.propTypes = propTypes;

export default CallsRow;
