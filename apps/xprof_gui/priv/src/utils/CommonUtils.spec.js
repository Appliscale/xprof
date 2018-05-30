import * as CommonUtils from './CommonUtils';
import {
  CAPTURE_CALLS_ACTION,
  DPS_ACTION,
  CALLS_COLUMNS,
  SORT,
} from '../constants';

describe('Common utils', () => {
  describe('commonArrayPrefix', () => {
    it('should return common prefix', () => {
      // given
      const functions = ['qwerty', 'asdfg', 'qweasd'];
      // when
      const result = CommonUtils.commonArrayPrefix(functions);
      // then
      expect(result).toBe('qwe');
    });

    it('should return itself if only one element in array', () => {
      // given
      const functions = ['qwerty'];
      // when
      const result = CommonUtils.commonArrayPrefix(functions);
      // then
      expect(result).toBe(functions[0]);
    });

    it('should return empty string if not maching', () => {
      // given
      const functions = ['qwerty', 'asdfg', 'zxcvb'];
      // when
      const result = CommonUtils.commonArrayPrefix(functions);
      // then
      expect(result).toBe('');
    });
  });

  describe('callsDecision', () => {
    it('should detect app initialization based on incoming list', () => {
      // given
      const json = {
        capture_id: 4,
        items: [1, 2, 3],
        has_more: false,
      };
      // when
      const decision = CommonUtils.callsDecision(json, undefined);
      // then
      expect(decision).toBe(CAPTURE_CALLS_ACTION.APP_INITIALIZATION);
    });

    it("should detect beginning of first call's capturing", () => {
      // given
      const json = {
        capture_id: 1,
        items: [1],
        has_more: true,
      };
      // when
      const decision = CommonUtils.callsDecision(json, undefined);
      // then
      expect(decision).toBe(CAPTURE_CALLS_ACTION.START_FIRST_CALLS_CAPTURE);
    });

    it("should detect beginning of next call's capturing", () => {
      // given
      const json = {
        capture_id: 2,
        items: [1, 2],
        has_more: true,
      };
      const lastCalls = {
        capture_id: 1,
      };
      // when
      const decision = CommonUtils.callsDecision(json, lastCalls);
      // then
      expect(decision).toBe(CAPTURE_CALLS_ACTION.START_NEXT_CALLS_CAPTURE);
    });

    it("should detect ongoing capturing of function's calls", () => {
      // given
      const json = {
        capture_id: 1,
        items: [1, 2],
        has_more: true,
      };
      const lastCalls = {
        capture_id: json.capture_id,
      };
      // when
      const decision = CommonUtils.callsDecision(json, lastCalls);
      // then
      expect(decision).toBe(CAPTURE_CALLS_ACTION.CAPTURING);
    });

    it("should detect last bunch of function's calls", () => {
      // given
      const json = {
        capture_id: 1,
        items: [1, 3],
        has_more: false,
      };
      const lastCalls = {
        capture_id: json.capture_id,
      };
      // when
      const decision = CommonUtils.callsDecision(json, lastCalls);
      // then
      expect(decision).toBe(CAPTURE_CALLS_ACTION.LAST_CALLS_CAPTURE);
    });

    it('should return undefined decision', () => {
      // given
      const json = {
        capture_id: undefined,
      };
      // when
      const decision = CommonUtils.callsDecision(json, undefined);
      // then
      expect(decision).toBe(undefined);
    });
  });

  describe('dpsDecision', () => {
    it('should detect first samples', () => {
      // given
      const timestamp = 0;
      // when
      const decision = CommonUtils.dpsDecision([], timestamp);
      // then
      expect(decision).toBe(DPS_ACTION.FIRST_DPS);
    });

    it('should detect gap in time beetwen last sample and new samples', () => {
      // given
      const timestamp = 10;
      const dps = [{ time: 15 }, { time: 16 }];
      // when
      const decision = CommonUtils.dpsDecision(dps, timestamp);
      // then
      expect(decision).toBe(DPS_ACTION.MISSING_DPS);
    });

    it('should detect continuous samples', () => {
      // given
      const timestamp = 10;
      const dps = [{ time: 11 }, { time: 12 }];
      // when
      const decision = CommonUtils.dpsDecision(dps, timestamp);
      // then
      expect(decision).toBe(DPS_ACTION.CONTINUOUS_DPS);
    });

    it('should return undefined decision', () => {
      // given
      const timestamp = 10;
      const dps = [{ time: 5 }, { time: 6 }];
      // when
      const decision = CommonUtils.dpsDecision(dps, timestamp);
      // then
      expect(decision).toBe(undefined);
    });
  });

  describe('isIntegerInRange', () => {
    it('should return true if integer is in range', () => {
      expect(CommonUtils.isIntegerInRange(15, 10, 20)).toBe(true);
    });
    it('should return false if integer is lower than range', () => {
      expect(CommonUtils.isIntegerInRange(5, 10, 20)).toBe(false);
    });
    it('should return true if integer equals lower limit', () => {
      expect(CommonUtils.isIntegerInRange(10, 10, 20)).toBe(true);
    });
    it('should return true if integer equals upper limit', () => {
      expect(CommonUtils.isIntegerInRange(20, 10, 20)).toBe(true);
    });
    it('should return false if integer is higher than range', () => {
      expect(CommonUtils.isIntegerInRange(25, 10, 20)).toBe(false);
    });
    it('should return true if string integer is in range', () => {
      expect(CommonUtils.isIntegerInRange('15', 10, 20)).toBe(true);
    });
    it('shoud return false if value is float', () => {
      expect(CommonUtils.isIntegerInRange(15.234, 10, 20)).toBe(false);
    });
  });

  describe('sortItems', () => {
    it('should sort asceding by id number values', () => {
      // given
      const toSort = [{ id: 1 }, { id: 2 }];
      // when
      const sorted = CommonUtils
        .sortItems(toSort, CALLS_COLUMNS.ID, SORT.ASCENDING);
      // then
      expect(sorted[0].id).toBe(toSort[0].id);
      expect(sorted[1].id).toBe(toSort[1].id);
    });

    it('should sort asceding by id number values', () => {
      // given
      const toSort = [{ id: 1 }, { id: 2 }];
      // when
      const sorted = CommonUtils
        .sortItems(toSort, CALLS_COLUMNS.ID, SORT.DESCENDING);
      // then
      expect(sorted[0].id).toBe(toSort[1].id);
      expect(sorted[1].id).toBe(toSort[0].id);
    });

    it('should sort asceding by id string values', () => {
      // given
      const toSort = [{ id: 'abc' }, { id: 'cba' }];
      // when
      const sorted = CommonUtils
        .sortItems(toSort, CALLS_COLUMNS.ID, SORT.DESCENDING);
      // then
      expect(sorted[0].id).toBe(toSort[1].id);
      expect(sorted[1].id).toBe(toSort[0].id);
    });

    it('should sort asceding by id string values', () => {
      // given
      const toSort = [{ id: 'abc' }, { id: 'cba' }];
      // when
      const sorted = CommonUtils
        .sortItems(toSort, CALLS_COLUMNS.ID, SORT.DESCENDING);
      // then
      expect(sorted[0].id).toBe(toSort[1].id);
      expect(sorted[1].id).toBe(toSort[0].id);
    });
  });
});
