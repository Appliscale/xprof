export const COLUMNS = {
  time: "time",
  count: "count",
  max: "max",
  p99: "p99",
  p90: "p90",
  p75: "p75",
  p50: "p50",
  p25: "p25",
  mean: "mean",
  min: "min",
  median: "median",
  memsize: "memsize",
  stddev: "stddev",
};
export const DATA = {
  json: [],
  keys: {
    x: COLUMNS.time,
    value: [
      COLUMNS.min,
      COLUMNS.mean,
      // COLUMNS.median,
      COLUMNS.max,
      // COLUMNS.stddev,
      // COLUMNS.p25,
      COLUMNS.p50,
      COLUMNS.p75,
      COLUMNS.p90,
      COLUMNS.p99,
      // COLUMNS.memsize,
      COLUMNS.count,
    ]
  },
  hide: [
    COLUMNS.max,
    COLUMNS.p90,
    COLUMNS.p75,
    COLUMNS.p50,
  ],
  axes: {
    count: "y2",
  },
  names: {
    count: "count",
    max: "max",
    p99: "99th perc",
    p90: "90th perc",
    p75: "75th perc",
    p50: "50th perc",
    p25: "25th perc",
    mean: "mean",
    min: "min",
    median: "median",
    memsize: "memsize",
    stddev: "stddev",
  },
  colors: {
    count: "#98FB98",
    max: "#8C2A04",
    p99: "#E24806",
    p90: "#E24806",
    p75: "#E26606",
    p50: "#E26606",
    mean: "#FFAA00",
    min: "#D3D004",
  }
};
export const POINT = { show: false };
export const GRID = {
  x: { show: true },
  y: { show: true }
};
export const AXIS = {
  x: {
    type: "timeseries",
    tick: {
      // Divide the span of 5*60 seconds nicely
      count: 12,
      fit: false,
      outer: false,
      format: "%H:%M:%S"
    }
  },
  y: {
    min: 0,
    // Would be nice to have some paddig but it should not screw up tick positions
    // Padding: { bottom: 5 }, // in pixels
    padding: { bottom: 2 },
    label: { text: "Call time", position: "outer-middle" },
    tick: {
      // Count: 6, // would be nice to have a bit less ticks then the default but by using count:
      // "The position of the ticks will be calculated precisely, so the values on the ticks will not be rounded nicely."
      outer: false,
      format: function(d) {
        return d3.format(".2s")(d / 1000000) + "s";
      }
    }
  },
  y2: {
    show: true,
    min: 0,
    padding: { bottom: 2 },
    show: true,
    label: { text: "Call count", position: "outer-middle" },
    tick: {
      outer: false
    }
  }
};
export const TRANSITION = { duration: 0 };
export const MAX_DPS = 180;
export const GET_SAMPLES_INTERVAL = 1000;
export const GET_FUNS_INTERVAL = 500;
export const CAPTURE_CALLS_INTERVAL = 500;
export const GET_STATUS_INTERVAL = 1000;