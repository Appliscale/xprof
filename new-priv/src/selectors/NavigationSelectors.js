import { createSelector } from 'reselect';
import { getQuery } from '../selectors/CommonSelectors';

export const getValue = createSelector(getQuery);
export const a = 1;
