import { format } from 'd3';

export const COLUMNS = {
  time: 'time',
  count: 'count',
  total_count: 'total_count',
  match_rate: 'match_rate',
  max: 'max',
  p99: 'p99',
  p90: 'p90',
  p75: 'p75',
  p50: 'p50',
  p25: 'p25',
  mean: 'mean',
  min: 'min',
  median: 'median',
  memsize: 'memsize',
  stddev: 'stddev',
};
export const DATA = {
  json: [],
  keys: {
    x: COLUMNS.time,
    // value: [
    //   COLUMNS.min,
    //   COLUMNS.mean,
    //   // COLUMNS.median,
    //   COLUMNS.max,
    //   // COLUMNS.stddev,
    //   // COLUMNS.p25,
    //   COLUMNS.p50,
    //   COLUMNS.p75,
    //   COLUMNS.p90,
    //   COLUMNS.p99,
    //   // COLUMNS.memsize,
    //   COLUMNS.count,
    // ],
  },
  hide: [COLUMNS.max, COLUMNS.p90, COLUMNS.p75, COLUMNS.p50,
    COLUMNS.total_count, COLUMNS.match_rate],
  axes: {
    count: 'y2',
    total_count: 'y2',
    match_rate: 'y2',
  },
  names: {
    count: 'count',
    max: 'max',
    p99: '99th perc',
    p90: '90th perc',
    p75: '75th perc',
    p50: '50th perc',
    p25: '25th perc',
    mean: 'mean',
    min: 'min',
  },
  colors: {
    count: '#98FB98',
    total_count: '44AA44',
    max: '#8C2A04',
    p99: '#E24806',
    p90: '#E24806',
    p75: '#E26606',
    p50: '#E26606',
    mean: '#FFAA00',
    min: '#D3D004',
  },
};
export const POINT = { show: false };
export const GRID = {
  x: { show: true },
  y: { show: true },
};
export const AXIS = {
  x: {
    type: 'timeseries',
    tick: {
      // Divide the span of 5*60 seconds nicely
      count: 12,
      fit: false,
      outer: false,
      format: '%H:%M:%S',
    },
  },
  y: {
    min: 0,
    // Would be nice to have some paddig but it
    // should not screw up tick positions
    // Padding: { bottom: 5 }, // in pixels
    padding: { bottom: 2 },
    label: { text: 'Call time', position: 'outer-middle' },
    tick: {
      // Count: 6,
      // would be nice to have a bit less ticks then the default
      // but by using count:
      // "The position of the ticks will be calculated precisely,
      // so the values on the ticks will not be rounded nicely."
      outer: false,
      format(d) {
        return `${format('.2s')(d / 1000000)}s`;
      },
    },
  },
  y2: {
    show: true,
    min: 0,
    padding: { bottom: 2 },
    label: { text: 'Call count / Match rate %', position: 'outer-middle' },
    tick: {
      outer: false,
    },
  },
};
export const TRANSITION = { duration: 0 };

export const GRAPH_INITIAL_SIZE = {
  width: 0,
  height: 0,
  marginTop: 20,
  marginRight: 0,
  marginBottom: 70,
  marginLeft: 0,
};
