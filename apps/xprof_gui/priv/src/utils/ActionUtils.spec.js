import * as ActionUtils from './ActionsUtils';
import * as XProf from '../api';
import { CALLS_COLUMNS, SORT, DPS_LIMIT } from '../constants';

jest.mock('../actions');
jest.mock('../api');

const dispatch = jest.fn();

describe('Action utils', () => {
  describe('determineNextCallsForFun', () => {
    const name = 'ets:lookup/2';
    const items = [
      {
        id: 1, pid: '<0.380.0>', call_time: 8, args: 'arg', res: '2',
      },
      {
        id: 2, pid: '<0.379.0>', call_time: 4, args: 'arg', res: '2',
      },
      {
        id: 3, pid: '<0.380.0>', call_time: 14, args: 'arg', res: '2',
      },
    ];
    let calls;

    beforeEach(() => {
      calls = {
        [name]: [
          {
            capture_id: 1,
            items,
            has_more: false,
            sort: {
              items: items.map(item => ({ ...item, expanded: false })),
              column: CALLS_COLUMNS.ID,
              order: SORT.ASCENDING,
            },
          },
        ],
      };
    });

    it('should create new array when app initialize', () => {
      // given
      const json = { capture_id: 1, has_more: false, items };
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, undefined, undefined, name);
      // then
      expect(result.length).toBe(1);
      expect(result[0].capture_id).toBe(json.capture_id);
      expect(result[0].has_more).toBe(json.has_more);
      expect(result[0].items).toBe(json.items);
      expect(result[0].sort.items[0].expanded).toBe(false);
    });

    it('should create new array for first functions calls list', () => {
      // given
      const json = { capture_id: 2, has_more: true, items };
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, undefined, undefined, name);
      // then
      expect(result.length).toBe(1);
      expect(result[0].capture_id).toBe(json.capture_id);
      expect(result[0].has_more).toBe(json.has_more);
      expect(result[0].items).toBe(json.items);
      expect(result[0].sort.items[0].expanded).toBe(false);
    });

    it('should add new element in array for new set of calls', () => {
      // given
      const json = { capture_id: 2, has_more: true, items };
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, calls[name][0], calls, name);
      // then
      expect(result.length).toBe(2);
      expect(result[1].capture_id).toBe(json.capture_id);
      expect(result[1].has_more).toBe(json.has_more);
      expect(result[1].items).toBe(json.items);
      expect(result[1].sort.items[0].expanded).toBe(false);
    });

    it('should add incoming items to array', () => {
      // given
      const json = { capture_id: 1, has_more: true, items };
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, calls[name][0], calls, name);
      // then
      expect(result.length).toBe(1);
      expect(result[0].items.length)
        .toBe(json.items.length + calls[name][0].items.length);
      expect(result[0].has_more).toBe(json.has_more);
      expect(result[0].items).toEqual([...calls[name][0].items, ...json.items]);
      expect(result[0].sort.items[0].expanded).toBe(false);
    });

    it('should expand sort incoming items and add to array', () => {
      // given
      const json = { capture_id: 1, has_more: true, items };
      calls[name][0].sort.column = CALLS_COLUMNS.CALL_TIME;
      calls[name][0].sort.order = SORT.DESCENDING;
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, calls[name][0], calls, name);
      // then
      expect(result.length).toBe(1);
      expect(result[0].items.length)
        .toBe(json.items.length + calls[name][0].items.length);
      expect(result[0].has_more).toBe(json.has_more);
      expect(result[0].items).toEqual([...calls[name][0].items, ...json.items]);
      expect(result[0].sort.items.length).toBe(result[0].items.length);
      expect(result[0].sort.items)
        .not.toEqual([...calls[name][0].items, ...json.items]);
      expect(result[0].sort.items[0].expanded).toBe(false);
    });

    it('should add incoming items to last object in result array', () => {
      // given
      const json = { capture_id: 1, has_more: false, items };
      calls[name].push({});
      calls[name].push({});
      // when
      const result =
        ActionUtils.determineNextCallsForFun(json, calls[name][0], calls, name);
      // then
      expect(result.length).toBe(3);
    });
  });

  describe('determineNextControl', () => {
    const items = [
      {
        id: 1, pid: '<0.380.0>', call_time: 8, args: 'arg', res: '2',
      },
      {
        id: 2, pid: '<0.379.0>', call_time: 4, args: 'arg', res: '2',
      },
      {
        id: 3, pid: '<0.380.0>', call_time: 14, args: 'arg', res: '2',
      },
    ];
    const lastCalls = {
      capture_id: 1,
      items,
      has_more: false,
      sort: {
        items,
        column: 'id',
        order: 'ASCENDING',
      },
    };

    it('should reset calls control during app initialization', () => {
      // given
      const json = { capture_id: 1, has_more: false, items };
      // when
      const result = ActionUtils.determineNextControl(json, undefined);
      // then
      expect(result.threshold).toBeUndefined();
      expect(result.limit).toBeUndefined();
      expect(result.collecting).toBe(false);
    });

    it('should reset calls control during capturing last calls', () => {
      // given
      const json = { capture_id: 1, has_more: false, items };
      // when
      const result = ActionUtils.determineNextControl(json, lastCalls);
      // then
      expect(result.threshold).toBeUndefined();
      expect(result.limit).toBeUndefined();
      expect(result.collecting).toBe(false);
    });

    it('should set calls control during capturing', () => {
      // given
      const json = {
        capture_id: 1, has_more: true, items, threshold: '10', limit: '20',
      };
      // when
      const result = ActionUtils.determineNextControl(json, undefined);
      // then
      expect(result.threshold).toBe(json.threshold);
      expect(result.limit).toBe(json.limit);
      expect(result.collecting).toBe(true);
    });

    it('should set calls control during capturing of next calls', () => {
      // given
      const json = {
        capture_id: 2, has_more: true, items, threshold: '10', limit: '20',
      };
      // when
      const result = ActionUtils.determineNextControl(json, lastCalls);
      // then
      expect(result.threshold).toBe(json.threshold);
      expect(result.limit).toBe(json.limit);
      expect(result.collecting).toBe(true);
    });
  });

  describe('determineIncomingDps', () => {
    it('should fill with zeros', () => {
      // given
      const dps = [{ time: 1000 }, { time: 1001 }, { time: 1002 }];
      const timestamp = 0;
      // when
      const result = ActionUtils.determineIncomingDps(dps, timestamp);
      // then
      expect(result.length).toBe(DPS_LIMIT + dps.length);
      expect(result[0].time).toBe((dps[0].time - DPS_LIMIT) * 1000);
      expect(result[result.length - 1].time)
        .toBe(dps[dps.length - 1].time * 1000);
    });

    it('should fill gap with zeros', () => {
      // given
      const dps = [{ time: 1000 }, { time: 1001 }, { time: 1002 }];
      const timestamp = 990;
      // when
      const result = ActionUtils.determineIncomingDps(dps, timestamp);
      // then
      expect(result.length).toBe(dps[dps.length - 1].time - timestamp);
      expect(result[0].time).toBe((timestamp + 1) * 1000);
      expect(result[result.length - 1].time)
        .toBe(dps[dps.length - 1].time * 1000);
    });

    it('should return new dps', () => {
      // given
      const dps = [{ time: 1000 }, { time: 1001 }, { time: 1002 }];
      const timestamp = 999;
      // when
      const result = ActionUtils.determineIncomingDps(dps, timestamp);
      // then
      expect(result.length).toBe(3);
      expect(result).toEqual(dps.map(sample => ({
        ...sample,
        time: sample.time * 1000,
      })));
    });

    it('should return empty result if cant make decision', () => {
      // given
      const dps = [{ time: 1000 }, { time: 1001 }, { time: 1002 }];
      const timestamp = 11111;
      // when
      const result = ActionUtils.determineIncomingDps(dps, timestamp);
      // then
      expect(result.length).toBe(0);
    });
  });


  describe('determineNextCalls', () => {
    const mockMonitoredCollection = [
      {
        graph_type: 'grid',
        mfa: ['mod', 'fun', 'arity'],
        query: 'modfun/arity',
      },
      {
        graph_type: 'grid',
        mfa: ['mod2', 'fun2', 'arity2'],
        query: 'mod2fun2/arity2',
      },
    ];

    beforeEach(() => {
      XProf.getFunctionsCalls.mockClear();
      XProf.getFunctionsCalls.mockReturnValue({ json: [] });
    });

    it("should call xprof api for function's calls", async () => {
      // given
      const state = { tracing: { calls: {} } };
      const { calls } = state.tracing;
      // when
      await ActionUtils
        .determineNextCalls(dispatch, state, mockMonitoredCollection, calls);
      // then
      expect(XProf.getFunctionsCalls).toHaveBeenCalledTimes(2);
    });

    it('should set calls control', async () => {
      // given
      const state = { tracing: { calls: {} } };
      const { calls } = state.tracing;

      XProf.getFunctionsCalls.mockReturnValue({
        json: {
          capture_id: 1,
          items: [1, 2],
        },
      });
      // when
      await ActionUtils
        .determineNextCalls(dispatch, state, mockMonitoredCollection, calls);
      // then
      expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it('should return properly shaped object', async () => {
      // given
      const state = { tracing: { calls: {} } };
      const { calls } = state.tracing;

      XProf.getFunctionsCalls.mockReturnValue({
        json: {
          capture_id: 1,
          items: [1, 2],
        },
      });
      // when
      const result = await ActionUtils
        .determineNextCalls(dispatch, state, mockMonitoredCollection, calls);
      // then
      expect(result[mockMonitoredCollection[0].query]).toBeDefined();
      expect(result[mockMonitoredCollection[1].query]).toBeDefined();
    });
  });

  describe('determineNextData', () => {
    const name1 = 'modfun/arity';
    const name2 = 'mod2fun2/arity2';

    const mockMonitoredCollection = [
      {
        graph_type: 'grid',
        mfa: ['mod', 'fun', 'arity'],
        query: name1,
      },
      {
        graph_type: 'grid',
        mfa: ['mod2', 'fun2', 'arity2'],
        query: name2,
      },
    ];

    beforeEach(() => {
      XProf.getFunctionsSamples.mockClear();
      XProf.getFunctionsSamples.mockReturnValue({ json: [] });
    });

    it('should return next set of data', async () => {
      // given
      XProf.getFunctionsSamples.mockReturnValue({ json: [{ time: 13 }] });
      const data = {
        [name1]: [{ time: 10000 }, { time: 11000 }, { time: 12000 }],
        [name2]: [{ time: 10000 }, { time: 11000 }, { time: 12000 }],
      };
      // when
      const result = await ActionUtils
        .determineNextData(mockMonitoredCollection, data);
      // then
      expect(result[name1].length).toBe(4);
    });

    it('should return array with lenght of DPS_LIMIT', async () => {
      // given
      XProf.getFunctionsSamples.mockReturnValue({ json: [{ time: 13 }] });
      // when
      const result = await ActionUtils
        .determineNextData(mockMonitoredCollection, {});
      // then
      expect(result[name1].length).toBe(DPS_LIMIT);
    });

    it('should call XProf API for data for each function', async () => {
      // given
      XProf.getFunctionsSamples.mockReturnValue({ json: [{ time: 13 }] });
      // when
      await ActionUtils.determineNextData(mockMonitoredCollection, {});
      // then
      expect(XProf.getFunctionsSamples).toHaveBeenCalledTimes(2);
    });
  });

  describe('determineNextControlSwitch', () => {
    const name = 'module.fun/arity';
    const mockMonitored = {
      graph_type: 'grid',
      mfa: ['module', 'fun', 'arity'],
      query: name,
    };

    beforeEach(() => {
      XProf.stopCapturingFunctionsCalls.mockClear();
      XProf.stopCapturingFunctionsCalls.mockReturnValue({ json: [] });

      XProf.startCapturingFunctionsCalls.mockClear();
      XProf.startCapturingFunctionsCalls.mockReturnValue({ json: [] });
    });

    it('should stop capturing functions calls', async () => {
      // when
      const result = await ActionUtils
        .determineNextControlSwitch({ collecting: true }, mockMonitored);
      // then
      expect(XProf.stopCapturingFunctionsCalls).toHaveBeenCalledTimes(1);
      expect(result.collecting).toBe(false);
    });

    it('should start capturing functions calls', async () => {
      // when
      const result = await ActionUtils
        .determineNextControlSwitch({ collecting: false }, mockMonitored);
      // then
      expect(XProf.startCapturingFunctionsCalls).toHaveBeenCalledTimes(1);
      expect(result.collecting).toBe(true);
    });
  });
});
