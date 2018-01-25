import * as URL from './ApiConstants';
import * as request from './ApiUtils';

/**
   * @api {get} /flowmeters/alarm/:id Get flowmeter alarm by id
   * @apiName GetAlarm
   * @apiGroup FlowmeterAlarms
   * @apiVersion 1.0.0
   *
   * @apiParam {Number} id Alarm ID
   *
   * @apiSuccess {Object} flowmeterAlarm Get
     information about flowmeter alarm
   * @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
  {
  "kind": "FLOWMETER_ALARM",
  "id": 1,
  "type": "warning",
  "active": true,
  "parameterValue": 2.96,
  "reason": "pressure",
  "assignedUser": null,
  "startDate": "2017-12-17T16:50:00.000Z",
  "dma": {
      "id": "14_Z",
      "name": "Oporów-Klecina"
  },
  "flowmeter": {
      "id": "13_Z-14_Z_3",
      "name": "Wałbrzyska DN 225"
  }
  }
  */
export const getFunctionAutoexpansion = async query =>
  request.get(URL.FUNCTION_AUTOEXPANSION, { query });
/**
   * Removes all elements from array that predicate returns truthy for and
   * returns an array of the removed
   * elements. The predicate is bound to thisArg and invoked with
   * three arguments: (value, index, array).
   *
   * If a property name is provided for predicate the created
   * _.property style callback returns the property
   * value of the given element.
   *
   * If a value is also provided for thisArg the created
   * _.matchesProperty style callback returns true for
   * elements that have a matching property value, else false.
   *
   * If an object is provided for predicate the created
   * _.matches style callback returns true for elements that
   * have the properties of the given object, else false.
   *
   * Note: Unlike _.filter, this method mutates array.
   *
   * @param array The array to modify.
   * @param predicate The function invoked per iteration.
   * @param thisArg The this binding of predicate.
   * @return Returns the new array of removed elements.
   */
export const getAllMonitoredFunctions = async () =>
  request.get(URL.ALL_MONITORED_FUNCTIONS);
export const startMonitoringFunction = async query =>
  request.get(URL.START_MONITORING_FUNCTION, { query });
export const stopMonitoringFunction = async (mod, fun, arity) =>
  request.get(URL.STOP_MONITORING_FUNCTION, { mod, fun, arity });
export const getTracingStatus = async () => request.get(URL.GET_TRACING_STATUS);
export const setTracingStatus = async spec =>
  request.get(URL.SET_TRACING_STATUS, { spec });
export const getFunctionsSamples = async (mod, fun, arity, lastTimestamp) =>
  request.get(URL.GET_MONITORED_FUNCTION_DATA, {
    mod,
    fun,
    arity,
    last_ts: lastTimestamp,
  });

export const getFunctionsCalls = async (mod, fun, arity, offset) =>
  request.get(URL.GET_CALLS_FUNCTION, {
    mod,
    fun,
    arity,
    offset,
  });
export const startCapturingFunctionsCalls = async (
  mod,
  fun,
  arity,
  threshold,
  limit,
) =>
  request.get(URL.START_CAPTURING_CALLS, {
    mod,
    fun,
    arity,
    threshold,
    limit,
  });
export const stopCapturingFunctionsCalls = (mod, fun, arity) =>
  request.get(URL.STOP_CAPTURING_CALLS, { mod, fun, arity });
