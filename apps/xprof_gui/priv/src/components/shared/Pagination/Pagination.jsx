/* eslint
jsx-a11y/anchor-is-valid: 0,
jsx-a11y/click-events-have-key-events: 0,
jsx-a11y/no-noninteractive-element-interactions: 0,
no-mixed-operators: 0
*/
import PropTypes from 'prop-types';
import React from 'react';
import { range } from 'lodash';
import { VISIBLE_PAGES_NUMBER_LIMIT } from '../../../constants';

const defaultProps = {
  current: undefined,
  start: 0,
  onClickNext: () => {},
  onClickPrevious: () => {},
};

const propTypes = {
  current: PropTypes.number,
  count: PropTypes.number.isRequired,
  start: PropTypes.number,
  onClickNext: PropTypes.func,
  onClickPrevious: PropTypes.func,
  onChange: PropTypes.func.isRequired,
};

const isPageLimitExceeded = number => number > VISIBLE_PAGES_NUMBER_LIMIT;
// eslint-disable-next-line
const findLastPage = (start, number) =>
  isPageLimitExceeded(number) ? start + VISIBLE_PAGES_NUMBER_LIMIT : number;
const isStartVisible = start => start === 0;
const isEndVisible = (start, count) =>
  VISIBLE_PAGES_NUMBER_LIMIT >= count - start;

const Pagination = ({
  start,
  current,
  count,
  onClickNext,
  onClickPrevious,
  onChange,
}) => (
  <div className="form-group calles-nav">
    <div className="input-group">
      <nav aria-label="Page navigation">
        <ul className="pagination pagination-no-margin">
          {isPageLimitExceeded(count) && (
            <li
              onClick={() => !isStartVisible(start) && onClickPrevious()}
              className={isStartVisible(start) ? 'disabled' : ''}
            >
              <a
                className={
                  isStartVisible(start)
                    ? 'disabled-prev-next pointer'
                    : 'pointer'
                }
                aria-label="Previous"
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
          )}
          {range(start + 1, findLastPage(start, count) + 1).map(nr => (
            <li
              key={nr - 1}
              className={nr - 1 === current ? 'pointer active' : 'pointer'}
              onClick={() => nr - 1 !== current && onChange(nr - 1)}
            >
              <a>{nr}</a>
            </li>
          ))}
          {isPageLimitExceeded(count) && (
            <li
              onClick={() => !isEndVisible(start, count) && onClickNext()}
              className={isEndVisible(start, count) ? 'disabled' : ''}
            >
              <a
                className={
                  isEndVisible(start, count)
                    ? 'disabled-prev-next pointer'
                    : 'pointer'
                }
                aria-label="Next"
              >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  </div>
);

Pagination.defaultProps = defaultProps;
Pagination.propTypes = propTypes;

export default Pagination;
