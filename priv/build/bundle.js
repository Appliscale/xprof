webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(8);
	module.exports = __webpack_require__(11);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(2);

	__webpack_require__(4);

	__webpack_require__(5);

	__webpack_require__(6);

	__webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FlotGraph = function () {
	  function FlotGraph() {
	    _classCallCheck(this, FlotGraph);
	  }

	  _createClass(FlotGraph, [{
	    key: 'init',
	    value: function init(divid) {
	      this.lines = [{ label: "count", id: "count", data: [], lines: { show: false }, color: 3, yaxis: 2 }, { label: "max", id: "max", data: [], color: "#8c2a04", lines: { show: true, lineWidth: 1.0 }, yaxis: 1 }, { label: "99th perc", id: "p99", data: [], color: "#e24806", lines: { show: false, lineWidth: 1.0 }, yaxis: 1 }, { label: "90th perc", id: "p90", data: [], color: "#e24806", lines: { show: true, lineWidth: 1.0 }, yaxis: 1 }, { label: "75th perc", id: "p75", data: [], color: "#e26606", lines: { show: true, lineWidth: 1.0 }, yaxis: 1 }, { label: "50th perc", id: "p50", data: [], color: "#e26606", lines: { show: false, lineWidth: 1.0 }, yaxis: 1 }, { label: "mean", id: "mean", data: [], color: "#ffaa00", lines: { show: true, lineWidth: 3.0 }, yaxis: 1 }, { label: "min", id: "min", data: [], color: "#d3d004", lines: { show: true, lineWidth: 1.0 }, yaxis: 1 }];
	      //backup color
	      this.lines.map(function (x) {
	        return x.original_color = x.color;
	      });
	      this.divid = divid;
	      this.plot = $.plot(this.divid, [this.createDataSet([])], {
	        series: {
	          shadowSize: 0 },
	        legend: {
	          position: "sw",
	          labelFormatter: this.labelFormatter.bind(this),
	          noColumns: 8,
	          margin: [10, 0]
	        },
	        grid: {
	          hoverable: true
	        },
	        tooltip: {
	          show: true,
	          lines: true,
	          content: "%s: %y"
	        },
	        yaxes: [{
	          min: 0,
	          tickFormatter: function tickFormatter(v) {
	            return Math.round(v / 10.0) / 100.0 + " ms";
	          },
	          position: "left"
	        }, {
	          min: 0,
	          position: "right"
	        }],
	        xaxis: {
	          mode: "time",
	          show: true
	        }
	      });
	      this.updateLegendNoColumns();
	    }
	  }, {
	    key: 'labelFormatter',
	    value: function labelFormatter(label, series) {
	      var dataPoint = series.data.slice(-1)[0][1];
	      var val = Math.round(dataPoint / 10.0) / 100.0;
	      var unit = "ms";
	      if (label == "count") {
	        val = dataPoint;
	        unit = "calls/s";
	      }
	      var id = series.id + this.divid.substr(1);
	      return '<div class="legend-label" id="' + id + '">' + label + ' (' + val + ' ' + unit + ')</div>';
	    }
	  }, {
	    key: 'resize',
	    value: function resize() {
	      this.plot.resize();
	      this.plot.setupGrid();
	      this.updateLegendNoColumns();
	      this.plot.draw();
	      this.hookLegendClickCallbacks();
	    }
	  }, {
	    key: 'update',
	    value: function update(data) {
	      this.plot.setData(this.createDataSet(data));
	      this.plot.setupGrid();
	      this.updateLegendNoColumns();
	      this.plot.draw();
	      this.hookLegendClickCallbacks();
	    }
	  }, {
	    key: 'close',
	    value: function close(data) {}

	    // "reactive" legend

	  }, {
	    key: 'updateLegendNoColumns',
	    value: function updateLegendNoColumns() {
	      var opts = this.plot.getOptions();
	      var len = this.lines.length;
	      var w = this.plot.width();
	      var seriesLabelWidth = 117;
	      var units = Math.floor(w / seriesLabelWidth);
	      var exp = Math.max(0, Math.ceil(len / units) - 1);
	      opts.legend.noColumns = len / Math.pow(2, exp);
	    }
	  }, {
	    key: 'togglePlot',
	    value: function togglePlot(id) {
	      var line = this.lines.find(function (x) {
	        return x.label == id;
	      }).lines;
	      line.show = !line.show;
	    }
	  }, {
	    key: 'hookLegendClickCallbacks',
	    value: function hookLegendClickCallbacks() {
	      var _this = this;

	      this.lines.forEach(function (el) {
	        var selector = "#" + el.id + _this.divid.substr(1);
	        $(selector).click(function () {
	          return _this.togglePlot(el.label);
	        });
	      });
	    }
	  }, {
	    key: 'createDataSet',
	    value: function createDataSet(data) {
	      var result = this.lines.map(function (el) {
	        var datapoints = [];
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var item = _step.value;

	            datapoints.push([item.time * 1000, item[el.id]]);
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }

	        el.data = datapoints;
	        if (el.lines.show) {
	          el.color = el.original_color;
	        } else {
	          el.color = "#aaaaaa";
	        }

	        return el;
	      });

	      return result;
	    }
	  }]);

	  return FlotGraph;
	}();

	exports.default = FlotGraph;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/* Flot plugin for computing bottoms for filled line and bar charts.

	Copyright (c) 2007-2014 IOLA and Ole Laursen.
	Licensed under the MIT license.

	The case: you've got two series that you want to fill the area between. In Flot
	terms, you need to use one as the fill bottom of the other. You can specify the
	bottom of each data point as the third coordinate manually, or you can use this
	plugin to compute it for you.

	In order to name the other series, you need to give it an id, like this:

		var dataset = [
			{ data: [ ... ], id: "foo" } ,         // use default bottom
			{ data: [ ... ], fillBetween: "foo" }, // use first dataset as bottom
		];

		$.plot($("#placeholder"), dataset, { lines: { show: true, fill: true }});

	As a convenience, if the id given is a number that doesn't appear as an id in
	the series, it is interpreted as the index in the array instead (so fillBetween:
	0 can also mean the first series).

	Internally, the plugin modifies the datapoints in each series. For line series,
	extra data points might be inserted through interpolation. Note that at points
	where the bottom line is not defined (due to a null point or start/end of line),
	the current line will show a gap too. The algorithm comes from the
	jquery.flot.stack.js plugin, possibly some code could be shared.

	*/

	(function ( $ ) {

		var options = {
			series: {
				fillBetween: null	// or number
			}
		};

		function init( plot ) {

			function findBottomSeries( s, allseries ) {

				var i;

				for ( i = 0; i < allseries.length; ++i ) {
					if ( allseries[ i ].id === s.fillBetween ) {
						return allseries[ i ];
					}
				}

				if ( typeof s.fillBetween === "number" ) {
					if ( s.fillBetween < 0 || s.fillBetween >= allseries.length ) {
						return null;
					}
					return allseries[ s.fillBetween ];
				}

				return null;
			}

			function computeFillBottoms( plot, s, datapoints ) {

				if ( s.fillBetween == null ) {
					return;
				}

				var other = findBottomSeries( s, plot.getData() );

				if ( !other ) {
					return;
				}

				var ps = datapoints.pointsize,
					points = datapoints.points,
					otherps = other.datapoints.pointsize,
					otherpoints = other.datapoints.points,
					newpoints = [],
					px, py, intery, qx, qy, bottom,
					withlines = s.lines.show,
					withbottom = ps > 2 && datapoints.format[2].y,
					withsteps = withlines && s.lines.steps,
					fromgap = true,
					i = 0,
					j = 0,
					l, m;

				while ( true ) {

					if ( i >= points.length ) {
						break;
					}

					l = newpoints.length;

					if ( points[ i ] == null ) {

						// copy gaps

						for ( m = 0; m < ps; ++m ) {
							newpoints.push( points[ i + m ] );
						}

						i += ps;

					} else if ( j >= otherpoints.length ) {

						// for lines, we can't use the rest of the points

						if ( !withlines ) {
							for ( m = 0; m < ps; ++m ) {
								newpoints.push( points[ i + m ] );
							}
						}

						i += ps;

					} else if ( otherpoints[ j ] == null ) {

						// oops, got a gap

						for ( m = 0; m < ps; ++m ) {
							newpoints.push( null );
						}

						fromgap = true;
						j += otherps;

					} else {

						// cases where we actually got two points

						px = points[ i ];
						py = points[ i + 1 ];
						qx = otherpoints[ j ];
						qy = otherpoints[ j + 1 ];
						bottom = 0;

						if ( px === qx ) {

							for ( m = 0; m < ps; ++m ) {
								newpoints.push( points[ i + m ] );
							}

							//newpoints[ l + 1 ] += qy;
							bottom = qy;

							i += ps;
							j += otherps;

						} else if ( px > qx ) {

							// we got past point below, might need to
							// insert interpolated extra point

							if ( withlines && i > 0 && points[ i - ps ] != null ) {
								intery = py + ( points[ i - ps + 1 ] - py ) * ( qx - px ) / ( points[ i - ps ] - px );
								newpoints.push( qx );
								newpoints.push( intery );
								for ( m = 2; m < ps; ++m ) {
									newpoints.push( points[ i + m ] );
								}
								bottom = qy;
							}

							j += otherps;

						} else { // px < qx

							// if we come from a gap, we just skip this point

							if ( fromgap && withlines ) {
								i += ps;
								continue;
							}

							for ( m = 0; m < ps; ++m ) {
								newpoints.push( points[ i + m ] );
							}

							// we might be able to interpolate a point below,
							// this can give us a better y

							if ( withlines && j > 0 && otherpoints[ j - otherps ] != null ) {
								bottom = qy + ( otherpoints[ j - otherps + 1 ] - qy ) * ( px - qx ) / ( otherpoints[ j - otherps ] - qx );
							}

							//newpoints[l + 1] += bottom;

							i += ps;
						}

						fromgap = false;

						if ( l !== newpoints.length && withbottom ) {
							newpoints[ l + 2 ] = bottom;
						}
					}

					// maintain the line steps invariant

					if ( withsteps && l !== newpoints.length && l > 0 &&
						newpoints[ l ] !== null &&
						newpoints[ l ] !== newpoints[ l - ps ] &&
						newpoints[ l + 1 ] !== newpoints[ l - ps + 1 ] ) {
						for (m = 0; m < ps; ++m) {
							newpoints[ l + ps + m ] = newpoints[ l + m ];
						}
						newpoints[ l + 1 ] = newpoints[ l - ps + 1 ];
					}
				}

				datapoints.points = newpoints;
			}

			plot.hooks.processDatapoints.push( computeFillBottoms );
		}

		$.plot.plugins.push({
			init: init,
			options: options,
			name: "fillbetween",
			version: "1.0"
		});

	})(jQuery);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/* Pretty handling of time axes.

	Copyright (c) 2007-2014 IOLA and Ole Laursen.
	Licensed under the MIT license.

	Set axis.mode to "time" to enable. See the section "Time series data" in
	API.txt for details.

	*/

	(function($) {

		var options = {
			xaxis: {
				timezone: null,		// "browser" for local to the client or timezone for timezone-js
				timeformat: null,	// format string to use
				twelveHourClock: false,	// 12 or 24 time in time mode
				monthNames: null	// list of names of months
			}
		};

		// round to nearby lower multiple of base

		function floorInBase(n, base) {
			return base * Math.floor(n / base);
		}

		// Returns a string with the date d formatted according to fmt.
		// A subset of the Open Group's strftime format is supported.

		function formatDate(d, fmt, monthNames, dayNames) {

			if (typeof d.strftime == "function") {
				return d.strftime(fmt);
			}

			var leftPad = function(n, pad) {
				n = "" + n;
				pad = "" + (pad == null ? "0" : pad);
				return n.length == 1 ? pad + n : n;
			};

			var r = [];
			var escape = false;
			var hours = d.getHours();
			var isAM = hours < 12;

			if (monthNames == null) {
				monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			}

			if (dayNames == null) {
				dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			}

			var hours12;

			if (hours > 12) {
				hours12 = hours - 12;
			} else if (hours == 0) {
				hours12 = 12;
			} else {
				hours12 = hours;
			}

			for (var i = 0; i < fmt.length; ++i) {

				var c = fmt.charAt(i);

				if (escape) {
					switch (c) {
						case 'a': c = "" + dayNames[d.getDay()]; break;
						case 'b': c = "" + monthNames[d.getMonth()]; break;
						case 'd': c = leftPad(d.getDate()); break;
						case 'e': c = leftPad(d.getDate(), " "); break;
						case 'h':	// For back-compat with 0.7; remove in 1.0
						case 'H': c = leftPad(hours); break;
						case 'I': c = leftPad(hours12); break;
						case 'l': c = leftPad(hours12, " "); break;
						case 'm': c = leftPad(d.getMonth() + 1); break;
						case 'M': c = leftPad(d.getMinutes()); break;
						// quarters not in Open Group's strftime specification
						case 'q':
							c = "" + (Math.floor(d.getMonth() / 3) + 1); break;
						case 'S': c = leftPad(d.getSeconds()); break;
						case 'y': c = leftPad(d.getFullYear() % 100); break;
						case 'Y': c = "" + d.getFullYear(); break;
						case 'p': c = (isAM) ? ("" + "am") : ("" + "pm"); break;
						case 'P': c = (isAM) ? ("" + "AM") : ("" + "PM"); break;
						case 'w': c = "" + d.getDay(); break;
					}
					r.push(c);
					escape = false;
				} else {
					if (c == "%") {
						escape = true;
					} else {
						r.push(c);
					}
				}
			}

			return r.join("");
		}

		// To have a consistent view of time-based data independent of which time
		// zone the client happens to be in we need a date-like object independent
		// of time zones.  This is done through a wrapper that only calls the UTC
		// versions of the accessor methods.

		function makeUtcWrapper(d) {

			function addProxyMethod(sourceObj, sourceMethod, targetObj, targetMethod) {
				sourceObj[sourceMethod] = function() {
					return targetObj[targetMethod].apply(targetObj, arguments);
				};
			};

			var utc = {
				date: d
			};

			// support strftime, if found

			if (d.strftime != undefined) {
				addProxyMethod(utc, "strftime", d, "strftime");
			}

			addProxyMethod(utc, "getTime", d, "getTime");
			addProxyMethod(utc, "setTime", d, "setTime");

			var props = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];

			for (var p = 0; p < props.length; p++) {
				addProxyMethod(utc, "get" + props[p], d, "getUTC" + props[p]);
				addProxyMethod(utc, "set" + props[p], d, "setUTC" + props[p]);
			}

			return utc;
		};

		// select time zone strategy.  This returns a date-like object tied to the
		// desired timezone

		function dateGenerator(ts, opts) {
			if (opts.timezone == "browser") {
				return new Date(ts);
			} else if (!opts.timezone || opts.timezone == "utc") {
				return makeUtcWrapper(new Date(ts));
			} else if (typeof timezoneJS != "undefined" && typeof timezoneJS.Date != "undefined") {
				var d = new timezoneJS.Date();
				// timezone-js is fickle, so be sure to set the time zone before
				// setting the time.
				d.setTimezone(opts.timezone);
				d.setTime(ts);
				return d;
			} else {
				return makeUtcWrapper(new Date(ts));
			}
		}
		
		// map of app. size of time units in milliseconds

		var timeUnitSize = {
			"second": 1000,
			"minute": 60 * 1000,
			"hour": 60 * 60 * 1000,
			"day": 24 * 60 * 60 * 1000,
			"month": 30 * 24 * 60 * 60 * 1000,
			"quarter": 3 * 30 * 24 * 60 * 60 * 1000,
			"year": 365.2425 * 24 * 60 * 60 * 1000
		};

		// the allowed tick sizes, after 1 year we use
		// an integer algorithm

		var baseSpec = [
			[1, "second"], [2, "second"], [5, "second"], [10, "second"],
			[30, "second"], 
			[1, "minute"], [2, "minute"], [5, "minute"], [10, "minute"],
			[30, "minute"], 
			[1, "hour"], [2, "hour"], [4, "hour"],
			[8, "hour"], [12, "hour"],
			[1, "day"], [2, "day"], [3, "day"],
			[0.25, "month"], [0.5, "month"], [1, "month"],
			[2, "month"]
		];

		// we don't know which variant(s) we'll need yet, but generating both is
		// cheap

		var specMonths = baseSpec.concat([[3, "month"], [6, "month"],
			[1, "year"]]);
		var specQuarters = baseSpec.concat([[1, "quarter"], [2, "quarter"],
			[1, "year"]]);

		function init(plot) {
			plot.hooks.processOptions.push(function (plot, options) {
				$.each(plot.getAxes(), function(axisName, axis) {

					var opts = axis.options;

					if (opts.mode == "time") {
						axis.tickGenerator = function(axis) {

							var ticks = [];
							var d = dateGenerator(axis.min, opts);
							var minSize = 0;

							// make quarter use a possibility if quarters are
							// mentioned in either of these options

							var spec = (opts.tickSize && opts.tickSize[1] ===
								"quarter") ||
								(opts.minTickSize && opts.minTickSize[1] ===
								"quarter") ? specQuarters : specMonths;

							if (opts.minTickSize != null) {
								if (typeof opts.tickSize == "number") {
									minSize = opts.tickSize;
								} else {
									minSize = opts.minTickSize[0] * timeUnitSize[opts.minTickSize[1]];
								}
							}

							for (var i = 0; i < spec.length - 1; ++i) {
								if (axis.delta < (spec[i][0] * timeUnitSize[spec[i][1]]
												  + spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2
									&& spec[i][0] * timeUnitSize[spec[i][1]] >= minSize) {
									break;
								}
							}

							var size = spec[i][0];
							var unit = spec[i][1];

							// special-case the possibility of several years

							if (unit == "year") {

								// if given a minTickSize in years, just use it,
								// ensuring that it's an integer

								if (opts.minTickSize != null && opts.minTickSize[1] == "year") {
									size = Math.floor(opts.minTickSize[0]);
								} else {

									var magn = Math.pow(10, Math.floor(Math.log(axis.delta / timeUnitSize.year) / Math.LN10));
									var norm = (axis.delta / timeUnitSize.year) / magn;

									if (norm < 1.5) {
										size = 1;
									} else if (norm < 3) {
										size = 2;
									} else if (norm < 7.5) {
										size = 5;
									} else {
										size = 10;
									}

									size *= magn;
								}

								// minimum size for years is 1

								if (size < 1) {
									size = 1;
								}
							}

							axis.tickSize = opts.tickSize || [size, unit];
							var tickSize = axis.tickSize[0];
							unit = axis.tickSize[1];

							var step = tickSize * timeUnitSize[unit];

							if (unit == "second") {
								d.setSeconds(floorInBase(d.getSeconds(), tickSize));
							} else if (unit == "minute") {
								d.setMinutes(floorInBase(d.getMinutes(), tickSize));
							} else if (unit == "hour") {
								d.setHours(floorInBase(d.getHours(), tickSize));
							} else if (unit == "month") {
								d.setMonth(floorInBase(d.getMonth(), tickSize));
							} else if (unit == "quarter") {
								d.setMonth(3 * floorInBase(d.getMonth() / 3,
									tickSize));
							} else if (unit == "year") {
								d.setFullYear(floorInBase(d.getFullYear(), tickSize));
							}

							// reset smaller components

							d.setMilliseconds(0);

							if (step >= timeUnitSize.minute) {
								d.setSeconds(0);
							}
							if (step >= timeUnitSize.hour) {
								d.setMinutes(0);
							}
							if (step >= timeUnitSize.day) {
								d.setHours(0);
							}
							if (step >= timeUnitSize.day * 4) {
								d.setDate(1);
							}
							if (step >= timeUnitSize.month * 2) {
								d.setMonth(floorInBase(d.getMonth(), 3));
							}
							if (step >= timeUnitSize.quarter * 2) {
								d.setMonth(floorInBase(d.getMonth(), 6));
							}
							if (step >= timeUnitSize.year) {
								d.setMonth(0);
							}

							var carry = 0;
							var v = Number.NaN;
							var prev;

							do {

								prev = v;
								v = d.getTime();
								ticks.push(v);

								if (unit == "month" || unit == "quarter") {
									if (tickSize < 1) {

										// a bit complicated - we'll divide the
										// month/quarter up but we need to take
										// care of fractions so we don't end up in
										// the middle of a day

										d.setDate(1);
										var start = d.getTime();
										d.setMonth(d.getMonth() +
											(unit == "quarter" ? 3 : 1));
										var end = d.getTime();
										d.setTime(v + carry * timeUnitSize.hour + (end - start) * tickSize);
										carry = d.getHours();
										d.setHours(0);
									} else {
										d.setMonth(d.getMonth() +
											tickSize * (unit == "quarter" ? 3 : 1));
									}
								} else if (unit == "year") {
									d.setFullYear(d.getFullYear() + tickSize);
								} else {
									d.setTime(v + step);
								}
							} while (v < axis.max && v != prev);

							return ticks;
						};

						axis.tickFormatter = function (v, axis) {

							var d = dateGenerator(v, axis.options);

							// first check global format

							if (opts.timeformat != null) {
								return formatDate(d, opts.timeformat, opts.monthNames, opts.dayNames);
							}

							// possibly use quarters if quarters are mentioned in
							// any of these places

							var useQuarters = (axis.options.tickSize &&
									axis.options.tickSize[1] == "quarter") ||
								(axis.options.minTickSize &&
									axis.options.minTickSize[1] == "quarter");

							var t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
							var span = axis.max - axis.min;
							var suffix = (opts.twelveHourClock) ? " %p" : "";
							var hourCode = (opts.twelveHourClock) ? "%I" : "%H";
							var fmt;

							if (t < timeUnitSize.minute) {
								fmt = hourCode + ":%M:%S" + suffix;
							} else if (t < timeUnitSize.day) {
								if (span < 2 * timeUnitSize.day) {
									fmt = hourCode + ":%M" + suffix;
								} else {
									fmt = "%b %d " + hourCode + ":%M" + suffix;
								}
							} else if (t < timeUnitSize.month) {
								fmt = "%b %d";
							} else if ((useQuarters && t < timeUnitSize.quarter) ||
								(!useQuarters && t < timeUnitSize.year)) {
								if (span < timeUnitSize.year) {
									fmt = "%b";
								} else {
									fmt = "%b %Y";
								}
							} else if (useQuarters && t < timeUnitSize.year) {
								if (span < timeUnitSize.year) {
									fmt = "Q%q";
								} else {
									fmt = "Q%q %Y";
								}
							} else {
								fmt = "%Y";
							}

							var rt = formatDate(d, fmt, opts.monthNames, opts.dayNames);

							return rt;
						};
					}
				});
			});
		}

		$.plot.plugins.push({
			init: init,
			options: options,
			name: 'time',
			version: '1.0'
		});

		// Time-axis support used to be in Flot core, which exposed the
		// formatDate function on the plot object.  Various plugins depend
		// on the function, so we need to re-expose it here.

		$.plot.formatDate = formatDate;
		$.plot.dateGenerator = dateGenerator;

	})(jQuery);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*
	 * jquery.flot.tooltip
	 * 
	 * description: easy-to-use tooltips for Flot charts
	 * version: 0.8.7
	 * authors: Krzysztof Urbas @krzysu [myviews.pl],Evan Steinkerchner @Roundaround
	 * website: https://github.com/krzysu/flot.tooltip
	 * 
	 * build on 2016-03-15
	 * released under MIT License, 2012
	*/ 
	(function ($) {
	    // plugin options, default values
	    var defaultOptions = {
	        tooltip: {
	            show: false,
	            cssClass: "flotTip",
	            content: "%s | X: %x | Y: %y",
	            // allowed templates are:
	            // %s -> series label,
	            // %c -> series color,
	            // %lx -> x axis label (requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels),
	            // %ly -> y axis label (requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels),
	            // %x -> X value,
	            // %y -> Y value,
	            // %x.2 -> precision of X value,
	            // %p -> percent
		    // %n -> value (not percent) of pie chart
	            xDateFormat: null,
	            yDateFormat: null,
	            monthNames: null,
	            dayNames: null,
	            shifts: {
	                x: 10,
	                y: 20
	            },
	            defaultTheme: true,
	            snap: true,
	            lines: false,
	            clickTips: false,

	            // callbacks
	            onHover: function (flotItem, $tooltipEl) {},

	            $compat: false
	        }
	    };

	    // dummy default options object for legacy code (<0.8.5) - is deleted later
	    defaultOptions.tooltipOpts = defaultOptions.tooltip;

	    // object
	    var FlotTooltip = function (plot) {
	        // variables
	        this.tipPosition = {x: 0, y: 0};

	        this.init(plot);
	    };

	    // main plugin function
	    FlotTooltip.prototype.init = function (plot) {
	        var that = this;

	        // detect other flot plugins
	        var plotPluginsLength = $.plot.plugins.length;
	        this.plotPlugins = [];

	        if (plotPluginsLength) {
	            for (var p = 0; p < plotPluginsLength; p++) {
	                this.plotPlugins.push($.plot.plugins[p].name);
	            }
	        }

	        plot.hooks.bindEvents.push(function (plot, eventHolder) {

	            // get plot options
	            that.plotOptions = plot.getOptions();

	            // for legacy (<0.8.5) implementations
	            if (typeof(that.plotOptions.tooltip) === 'boolean') {
	                that.plotOptions.tooltipOpts.show = that.plotOptions.tooltip;
	                that.plotOptions.tooltip = that.plotOptions.tooltipOpts;
	                delete that.plotOptions.tooltipOpts;
	            }

	            // if not enabled return
	            if (that.plotOptions.tooltip.show === false || typeof that.plotOptions.tooltip.show === 'undefined') return;

	            // shortcut to access tooltip options
	            that.tooltipOptions = that.plotOptions.tooltip;

	            if (that.tooltipOptions.$compat) {
	                that.wfunc = 'width';
	                that.hfunc = 'height';
	            } else {
	                that.wfunc = 'innerWidth';
	                that.hfunc = 'innerHeight';
	            }

	            // create tooltip DOM element
	            var $tip = that.getDomElement();

	            // bind event
	            $( plot.getPlaceholder() ).bind("plothover", plothover);
	            if (that.tooltipOptions.clickTips) {
	                $( plot.getPlaceholder() ).bind("plotclick", plotclick);
	            }
	            that.clickmode = false;

	            $(eventHolder).bind('mousemove', mouseMove);
	        });

	        plot.hooks.shutdown.push(function (plot, eventHolder){
	            $(plot.getPlaceholder()).unbind("plothover", plothover);
	            $(plot.getPlaceholder()).unbind("plotclick", plotclick);
	            plot.removeTooltip();
	            $(eventHolder).unbind("mousemove", mouseMove);
	        });

	        function mouseMove(e){
	            var pos = {};
	            pos.x = e.pageX;
	            pos.y = e.pageY;
	            plot.setTooltipPosition(pos);
	        }

	        /**
	         *  open the tooltip (if not already open) and freeze it on the current position till the next click
	         */
	        function plotclick(event, pos, item) {
	            if (! that.clickmode) {
	                // it is the click activating the clicktip
	                plothover(event, pos, item);
	                if (that.getDomElement().is(":visible")) {
	                    $(plot.getPlaceholder()).unbind("plothover", plothover);
	                    that.clickmode = true;
	                }
	            } else {
	                // it is the click deactivating the clicktip
	                $( plot.getPlaceholder() ).bind("plothover", plothover);
	                plot.hideTooltip();
	                that.clickmode = false;
	            }
	        }

	        function plothover(event, pos, item) {
	            // Simple distance formula.
	            var lineDistance = function (p1x, p1y, p2x, p2y) {
	                return Math.sqrt((p2x - p1x) * (p2x - p1x) + (p2y - p1y) * (p2y - p1y));
	            };

	            // Here is some voodoo magic for determining the distance to a line form a given point {x, y}.
	            var dotLineLength = function (x, y, x0, y0, x1, y1, o) {
	                if (o && !(o =
	                    function (x, y, x0, y0, x1, y1) {
	                        if (typeof x0 !== 'undefined') return { x: x0, y: y };
	                        else if (typeof y0 !== 'undefined') return { x: x, y: y0 };

	                        var left,
	                            tg = -1 / ((y1 - y0) / (x1 - x0));

	                        return {
	                            x: left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * (x1 - x0) + y0 - y1),
	                            y: tg * left - tg * x + y
	                        };
	                    } (x, y, x0, y0, x1, y1),
	                    o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))
	                ) {
	                    var l1 = lineDistance(x, y, x0, y0), l2 = lineDistance(x, y, x1, y1);
	                    return l1 > l2 ? l2 : l1;
	                } else {
	                    var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
	                    return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
	                }
	            };

	            if (item) {
	                plot.showTooltip(item, that.tooltipOptions.snap ? item : pos);
	            } else if (that.plotOptions.series.lines.show && that.tooltipOptions.lines === true) {
	                var maxDistance = that.plotOptions.grid.mouseActiveRadius;

	                var closestTrace = {
	                    distance: maxDistance + 1
	                };

	                var ttPos = pos;

	                $.each(plot.getData(), function (i, series) {
	                    var xBeforeIndex = 0,
	                        xAfterIndex = -1;

	                    // Our search here assumes our data is sorted via the x-axis.
	                    // TODO: Improve efficiency somehow - search smaller sets of data.
	                    for (var j = 1; j < series.data.length; j++) {
	                        if (series.data[j - 1][0] <= pos.x && series.data[j][0] >= pos.x) {
	                            xBeforeIndex = j - 1;
	                            xAfterIndex = j;
	                        }
	                    }

	                    if (xAfterIndex === -1) {
	                        plot.hideTooltip();
	                        return;
	                    }

	                    var pointPrev = { x: series.data[xBeforeIndex][0], y: series.data[xBeforeIndex][1] },
	                        pointNext = { x: series.data[xAfterIndex][0], y: series.data[xAfterIndex][1] };

	                    var distToLine = dotLineLength(series.xaxis.p2c(pos.x), series.yaxis.p2c(pos.y), series.xaxis.p2c(pointPrev.x),
	                        series.yaxis.p2c(pointPrev.y), series.xaxis.p2c(pointNext.x), series.yaxis.p2c(pointNext.y), false);

	                    if (distToLine < closestTrace.distance) {

	                        var closestIndex = lineDistance(pointPrev.x, pointPrev.y, pos.x, pos.y) <
	                            lineDistance(pos.x, pos.y, pointNext.x, pointNext.y) ? xBeforeIndex : xAfterIndex;

	                        var pointSize = series.datapoints.pointsize;

	                        // Calculate the point on the line vertically closest to our cursor.
	                        var pointOnLine = [
	                            pos.x,
	                            pointPrev.y + ((pointNext.y - pointPrev.y) * ((pos.x - pointPrev.x) / (pointNext.x - pointPrev.x)))
	                        ];

	                        var item = {
	                            datapoint: pointOnLine,
	                            dataIndex: closestIndex,
	                            series: series,
	                            seriesIndex: i
	                        };

	                        closestTrace = {
	                            distance: distToLine,
	                            item: item
	                        };

	                        if (that.tooltipOptions.snap) {
	                            ttPos = {
	                                pageX: series.xaxis.p2c(pointOnLine[0]),
	                                pageY: series.yaxis.p2c(pointOnLine[1])
	                            };
	                        }
	                    }
	                });

	                if (closestTrace.distance < maxDistance + 1)
	                    plot.showTooltip(closestTrace.item, ttPos);
	                else
	                    plot.hideTooltip();
	            } else {
	                plot.hideTooltip();
	            }
	        }

	        // Quick little function for setting the tooltip position.
	        plot.setTooltipPosition = function (pos) {
	            var $tip = that.getDomElement();

	            var totalTipWidth = $tip.outerWidth() + that.tooltipOptions.shifts.x;
	            var totalTipHeight = $tip.outerHeight() + that.tooltipOptions.shifts.y;
	            if ((pos.x - $(window).scrollLeft()) > ($(window)[that.wfunc]() - totalTipWidth)) {
	                pos.x -= totalTipWidth;
	            }
	            if ((pos.y - $(window).scrollTop()) > ($(window)[that.hfunc]() - totalTipHeight)) {
	                pos.y -= totalTipHeight;
	            }

		    /* 
		       The section applies the new positioning ONLY if pos.x and pos.y
		       are numbers. If they are undefined or not a number, use the last
		       known numerical position. This hack fixes a bug that kept pie 
		       charts from keeping their tooltip positioning.
		     */
		    
	            if (isNaN(pos.x)) {
			that.tipPosition.x = that.tipPosition.xPrev;
		    }
		    else {
			that.tipPosition.x = pos.x;
			that.tipPosition.xPrev = pos.x;
		    }
		    if (isNaN(pos.y)) {
			that.tipPosition.y = that.tipPosition.yPrev;
		    }
		    else {
			that.tipPosition.y = pos.y;
			that.tipPosition.yPrev = pos.y;
		    }
		    
	        };

	        // Quick little function for showing the tooltip.
	        plot.showTooltip = function (target, position, targetPosition) {
	            var $tip = that.getDomElement();

	            // convert tooltip content template to real tipText
	            var tipText = that.stringFormat(that.tooltipOptions.content, target);
	            if (tipText === '')
	                return;

	            $tip.html(tipText);
	            plot.setTooltipPosition({ x: position.pageX, y: position.pageY });
	            $tip.css({
	                left: that.tipPosition.x + that.tooltipOptions.shifts.x,
	                top: that.tipPosition.y + that.tooltipOptions.shifts.y
	            }).show();

	            // run callback
	            if (typeof that.tooltipOptions.onHover === 'function') {
	                that.tooltipOptions.onHover(target, $tip);
	            }
	        };

	        // Quick little function for hiding the tooltip.
	        plot.hideTooltip = function () {
	            that.getDomElement().hide().html('');
	        };

	        plot.removeTooltip = function() {
	            that.getDomElement().remove();
	        };
	    };

	    /**
	     * get or create tooltip DOM element
	     * @return jQuery object
	     */
	    FlotTooltip.prototype.getDomElement = function () {
	        var $tip = $('<div>');
	        if (this.tooltipOptions && this.tooltipOptions.cssClass) {
	            $tip = $('.' + this.tooltipOptions.cssClass);

	            if( $tip.length === 0 ){
	                $tip = $('<div />').addClass(this.tooltipOptions.cssClass);
	                $tip.appendTo('body').hide().css({position: 'absolute'});
	    
	                if(this.tooltipOptions.defaultTheme) {
	                    $tip.css({
	                        'background': '#fff',
	                        'z-index': '1040',
	                        'padding': '0.4em 0.6em',
	                        'border-radius': '0.5em',
	                        'font-size': '0.8em',
	                        'border': '1px solid #111',
	                        'display': 'none',
	                        'white-space': 'nowrap'
	                    });
	                }
	            }
	        }

	        return $tip;
	    };

	    /**
	     * core function, create tooltip content
	     * @param  {string} content - template with tooltip content
	     * @param  {object} item - Flot item
	     * @return {string} real tooltip content for current item
	     */
	    FlotTooltip.prototype.stringFormat = function (content, item) {
	        var percentPattern = /%p\.{0,1}(\d{0,})/;
	        var seriesPattern = /%s/;
	        var colorPattern = /%c/;
	        var xLabelPattern = /%lx/; // requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels, will be ignored if plugin isn't loaded
	        var yLabelPattern = /%ly/; // requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels, will be ignored if plugin isn't loaded
	        var xPattern = /%x\.{0,1}(\d{0,})/;
	        var yPattern = /%y\.{0,1}(\d{0,})/;
	        var xPatternWithoutPrecision = "%x";
	        var yPatternWithoutPrecision = "%y";
	        var customTextPattern = "%ct";
		var nPiePattern = "%n";
		
	        var x, y, customText, p, n;

	        // for threshold plugin we need to read data from different place
	        if (typeof item.series.threshold !== "undefined") {
	            x = item.datapoint[0];
	            y = item.datapoint[1];
	            customText = item.datapoint[2];
		}

		// for CurvedLines plugin we need to read data from different place
		    else if (typeof item.series.curvedLines !== "undefined") {
			x = item.datapoint[0];
			y = item.datapoint[1];
		    }
		    
	        else if (typeof item.series.lines !== "undefined" && item.series.lines.steps) {
	            x = item.series.datapoints.points[item.dataIndex * 2];
	            y = item.series.datapoints.points[item.dataIndex * 2 + 1];
	            // TODO: where to find custom text in this variant?
	            customText = "";
	        } else {
	            x = item.series.data[item.dataIndex][0];
	            y = item.series.data[item.dataIndex][1];
	            customText = item.series.data[item.dataIndex][2];
	        }

	        // I think this is only in case of threshold plugin
	        if (item.series.label === null && item.series.originSeries) {
	            item.series.label = item.series.originSeries.label;
	        }

	        // if it is a function callback get the content string
	        if (typeof(content) === 'function') {
	            content = content(item.series.label, x, y, item);
	        }

	        // the case where the passed content is equal to false
	        if (typeof(content) === 'boolean' && !content) {
	            return '';
	        }

		/* replacement of %ct and other multi-character templates must
		   precede the replacement of single-character templates 
		   to avoid conflict between '%c' and '%ct'  and similar substrings
		*/
		if (customText)
	            content = content.replace(customTextPattern, customText);

	        // percent match for pie charts and stacked percent
	        if (typeof (item.series.percent) !== 'undefined') {
	            p = item.series.percent;
	        } else if (typeof (item.series.percents) !== 'undefined') {
	            p = item.series.percents[item.dataIndex];
	        }        
	        if (typeof p === 'number') {
	            content = this.adjustValPrecision(percentPattern, content, p);
	        }

		// replace %n with number of items represented by slice in pie charts
		if (item.series.hasOwnProperty('pie')) {
		    if (typeof (item.series.data[0][1] !== 'undefined')) {
			n = item.series.data[0][1];
		    }
		}
		if (typeof n === 'number') {
	            content = content.replace(nPiePattern, n);
		}
		
	        // series match
	        if (typeof(item.series.label) !== 'undefined') {
	            content = content.replace(seriesPattern, item.series.label);
	        } else {
	            //remove %s if label is undefined
	            content = content.replace(seriesPattern, "");
	        }
	        
	        // color match
	        if (typeof(item.series.color) !== 'undefined') {
	            content = content.replace(colorPattern, item.series.color);
	        } else {
	            //remove %s if color is undefined
	            content = content.replace(colorPattern, "");
	        }

	        // x axis label match
	        if (this.hasAxisLabel('xaxis', item)) {
	            content = content.replace(xLabelPattern, item.series.xaxis.options.axisLabel);
	        } else {
	            //remove %lx if axis label is undefined or axislabels plugin not present
	            content = content.replace(xLabelPattern, "");
	        }

	        // y axis label match
	        if (this.hasAxisLabel('yaxis', item)) {
	            content = content.replace(yLabelPattern, item.series.yaxis.options.axisLabel);
	        } else {
	            //remove %ly if axis label is undefined or axislabels plugin not present
	            content = content.replace(yLabelPattern, "");
	        }

	        // time mode axes with custom dateFormat
	        if (this.isTimeMode('xaxis', item) && this.isXDateFormat(item)) {
	            content = content.replace(xPattern, this.timestampToDate(x, this.tooltipOptions.xDateFormat, item.series.xaxis.options));
	        }
	        if (this.isTimeMode('yaxis', item) && this.isYDateFormat(item)) {
	            content = content.replace(yPattern, this.timestampToDate(y, this.tooltipOptions.yDateFormat, item.series.yaxis.options));
	        }

	        // set precision if defined
	        if (typeof x === 'number') {
	            content = this.adjustValPrecision(xPattern, content, x);
	        }
	        if (typeof y === 'number') {
	            content = this.adjustValPrecision(yPattern, content, y);
	        }

	        // change x from number to given label, if given
	        if (typeof item.series.xaxis.ticks !== 'undefined') {

	            var ticks;
	            if (this.hasRotatedXAxisTicks(item)) {
	                // xaxis.ticks will be an empty array if tickRotor is being used, but the values are available in rotatedTicks
	                ticks = 'rotatedTicks';
	            } else {
	                ticks = 'ticks';
	            }

	            // see https://github.com/krzysu/flot.tooltip/issues/65
	            var tickIndex = item.dataIndex + item.seriesIndex;

	            for (var xIndex in item.series.xaxis[ticks]) {
	                if (item.series.xaxis[ticks].hasOwnProperty(tickIndex) && !this.isTimeMode('xaxis', item)) {
	                    var valueX = (this.isCategoriesMode('xaxis', item)) ? item.series.xaxis[ticks][tickIndex].label : item.series.xaxis[ticks][tickIndex].v;
	                    if (valueX === x) {
	                        content = content.replace(xPattern, item.series.xaxis[ticks][tickIndex].label.replace(/\$/g, '$$$$'));
	                    }
	                }
	            }
	        }

	        // change y from number to given label, if given
	        if (typeof item.series.yaxis.ticks !== 'undefined') {
	            for (var yIndex in item.series.yaxis.ticks) {
	                if (item.series.yaxis.ticks.hasOwnProperty(yIndex)) {
	                    var valueY = (this.isCategoriesMode('yaxis', item)) ? item.series.yaxis.ticks[yIndex].label : item.series.yaxis.ticks[yIndex].v;
	                    if (valueY === y) {
	                        content = content.replace(yPattern, item.series.yaxis.ticks[yIndex].label.replace(/\$/g, '$$$$'));
	                    }
	                }
	            }
	        }

	        // if no value customization, use tickFormatter by default
	        if (typeof item.series.xaxis.tickFormatter !== 'undefined') {
	            //escape dollar
	            content = content.replace(xPatternWithoutPrecision, item.series.xaxis.tickFormatter(x, item.series.xaxis).replace(/\$/g, '$$'));
	        }
	        if (typeof item.series.yaxis.tickFormatter !== 'undefined') {
	            //escape dollar
	            content = content.replace(yPatternWithoutPrecision, item.series.yaxis.tickFormatter(y, item.series.yaxis).replace(/\$/g, '$$'));
	        }

	        return content;
	    };

	    // helpers just for readability
	    FlotTooltip.prototype.isTimeMode = function (axisName, item) {
	        return (typeof item.series[axisName].options.mode !== 'undefined' && item.series[axisName].options.mode === 'time');
	    };

	    FlotTooltip.prototype.isXDateFormat = function (item) {
	        return (typeof this.tooltipOptions.xDateFormat !== 'undefined' && this.tooltipOptions.xDateFormat !== null);
	    };

	    FlotTooltip.prototype.isYDateFormat = function (item) {
	        return (typeof this.tooltipOptions.yDateFormat !== 'undefined' && this.tooltipOptions.yDateFormat !== null);
	    };

	    FlotTooltip.prototype.isCategoriesMode = function (axisName, item) {
	        return (typeof item.series[axisName].options.mode !== 'undefined' && item.series[axisName].options.mode === 'categories');
	    };

	    //
	    FlotTooltip.prototype.timestampToDate = function (tmst, dateFormat, options) {
	        var theDate = $.plot.dateGenerator(tmst, options);
	        return $.plot.formatDate(theDate, dateFormat, this.tooltipOptions.monthNames, this.tooltipOptions.dayNames);
	    };

	    //
	    FlotTooltip.prototype.adjustValPrecision = function (pattern, content, value) {

	        var precision;
	        var matchResult = content.match(pattern);
	        if( matchResult !== null ) {
	            if(RegExp.$1 !== '') {
	                precision = RegExp.$1;
	                value = value.toFixed(precision);

	                // only replace content if precision exists, in other case use thickformater
	                content = content.replace(pattern, value);
	            }
	        }
	        return content;
	    };

	    // other plugins detection below

	    // check if flot-axislabels plugin (https://github.com/markrcote/flot-axislabels) is used and that an axis label is given
	    FlotTooltip.prototype.hasAxisLabel = function (axisName, item) {
	        return ($.inArray('axisLabels', this.plotPlugins) !== -1 && typeof item.series[axisName].options.axisLabel !== 'undefined' && item.series[axisName].options.axisLabel.length > 0);
	    };

	    // check whether flot-tickRotor, a plugin which allows rotation of X-axis ticks, is being used
	    FlotTooltip.prototype.hasRotatedXAxisTicks = function (item) {
	        return ($.inArray('tickRotor',this.plotPlugins) !== -1 && typeof item.series.xaxis.rotatedTicks !== 'undefined');
	    };

	    //
	    var init = function (plot) {
	      new FlotTooltip(plot);
	    };

	    // define Flot plugin
	    $.plot.plugins.push({
	        init: init,
	        options: defaultOptions,
	        name: 'tooltip',
	        version: '0.8.5'
	    });

	})(jQuery);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($, _) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(9);

	var _graph_flot = __webpack_require__(1);

	var _graph_flot2 = _interopRequireDefault(_graph_flot);

	var _call_tracer = __webpack_require__(10);

	var _call_tracer2 = _interopRequireDefault(_call_tracer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var UPDATE_INTERVAL = 1000;
	var MAX_DPS = 5 * 60; //10 minutes

	var Graph = function (_React$Component) {
	  _inherits(Graph, _React$Component);

	  function Graph(props) {
	    _classCallCheck(this, Graph);

	    var _this = _possibleConstructorReturn(this, (Graph.__proto__ || Object.getPrototypeOf(Graph)).call(this, props));

	    _this.state = { dps: [], error: false, lastTs: 0 };
	    return _this;
	  }

	  _createClass(Graph, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.graph = new _graph_flot2.default();
	      this.graph.init("#" + this.chartId());

	      window.addEventListener('resize', this.handleResize.bind(this));

	      var ref = setInterval(this.getData.bind(this), UPDATE_INTERVAL);
	      var newState = this.state;
	      this.state.interval = ref;
	      this.setState(this.state);
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      window.removeEventListener('resize', this.handleResize.bind(this));
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var fun = this.props.fun;
	      var panelType = "panel panel-default ";
	      var errorMsg = "";

	      if (this.state.error) {
	        panelType += "panel-danger";
	        errorMsg = _react2.default.createElement(
	          'strong',
	          null,
	          '  -  communication error'
	        );
	      }

	      return _react2.default.createElement(
	        'div',
	        { className: panelType },
	        _react2.default.createElement(
	          'div',
	          { className: 'panel-heading' },
	          _react2.default.createElement(
	            'button',
	            { onClick: this.handleClose.bind(this), type: 'button',
	              className: 'close', 'data-dismiss': 'modal',
	              'aria-label': 'Close' },
	            _react2.default.createElement(
	              'span',
	              { 'aria-hidden': 'true' },
	              '\xD7'
	            )
	          ),
	          _react2.default.createElement(
	            'h3',
	            { className: 'panel-title' },
	            fun[0],
	            ':',
	            fun[1],
	            '/',
	            fun[2],
	            errorMsg
	          )
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'panel-body' },
	          _react2.default.createElement(
	            'div',
	            { className: 'container-fluid' },
	            _react2.default.createElement('div', { id: this.chartId(), className: 'chart' }),
	            _react2.default.createElement('br', null),
	            _react2.default.createElement(_call_tracer2.default, { fun: fun })
	          )
	        )
	      );
	    }

	    // Handle actions

	  }, {
	    key: 'handleResize',
	    value: function handleResize(e) {
	      this.graph.resize();
	    }
	  }, {
	    key: 'handleClose',
	    value: function handleClose() {
	      var _this2 = this;

	      var fun = this.props.fun;
	      clearInterval(this.state.interval);
	      $.ajax({
	        url: "/api/mon_stop",
	        data: { mod: fun[0], fun: fun[1], arity: fun[2] }
	      }).done(function () {
	        return _this2.props.removeGraph(fun);
	      }.bind(this));
	    }
	  }, {
	    key: 'getData',
	    value: function getData() {
	      var fun = this.props.fun;
	      var lastTs = this.state.lastTs;

	      $.ajax({
	        url: "/api/data",
	        data: {
	          mod: fun[0],
	          fun: fun[1],
	          arity: fun[2],
	          last_ts: lastTs
	        },
	        success: this.handleData.bind(this),
	        error: this.handleDataError.bind(this) });
	    }
	  }, {
	    key: 'handleData',
	    value: function handleData(data) {
	      var maxAge, currData, truncData, sortedData, padding, finalData;

	      maxAge = Math.floor(new Date().getTime() / 1000) - MAX_DPS;

	      currData = this.state.dps.concat(data);
	      sortedData = this.sortData(currData);
	      truncData = this.truncrateData(maxAge, sortedData);
	      padding = this.padData(maxAge, _.first(truncData).time);
	      finalData = padding.concat(truncData);

	      this.graph.update(finalData);

	      this.state.dps = truncData;
	      this.state.lastTs = _.last(sortedData).time;
	      this.state.error = false;
	      this.setState(this.state);
	    }
	  }, {
	    key: 'handleDataError',
	    value: function handleDataError(jqXHR, error) {
	      this.state.error = true;
	      this.setState(this.state);
	    }

	    // Helpers

	  }, {
	    key: 'sortData',
	    value: function sortData(data) {
	      return data.sort(function (a, b) {
	        return a.time - b.time;
	      });
	    }
	  }, {
	    key: 'truncrateData',
	    value: function truncrateData(maxAge, data) {
	      return data.filter(function (val) {
	        return val.time >= maxAge;
	      });
	    }
	  }, {
	    key: 'padData',
	    value: function padData(maxAge, firstTime) {
	      var data = [];
	      for (var i = maxAge; i < firstTime; i++) {
	        data.push({ time: i });
	      }return data;
	    }
	  }, {
	    key: 'chartId',
	    value: function chartId() {
	      var arity = this.props.fun[2];

	      // Guess what? Dots in module name (and Elixir modules contains it - 'Elixir.Enum':map/2) are problematic for ID.
	      var safe_module = this.props.fun[0].replace(/\./g, "-");

	      // And '*' is not a valid character too for an ID.
	      if (arity === "*") arity = "x";

	      return 'chart_' + safe_module + '_' + this.props.fun[1] + '_' + arity;
	    }
	  }]);

	  return Graph;
	}(_react2.default.Component);

	exports.default = Graph;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(9)))

/***/ },
/* 9 */,
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($, _) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(9);

	var _graph_flot = __webpack_require__(1);

	var _graph_flot2 = _interopRequireDefault(_graph_flot);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var CallsTracer = function (_React$Component) {
	  _inherits(CallsTracer, _React$Component);

	  function CallsTracer(props) {
	    _classCallCheck(this, CallsTracer);

	    var _this = _possibleConstructorReturn(this, (CallsTracer.__proto__ || Object.getPrototypeOf(CallsTracer)).call(this, props));

	    _this.state = {
	      capture_id: null,
	      offset: 0,
	      items: []
	    };
	    return _this;
	  }

	  _createClass(CallsTracer, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.getCaptureData();
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      clearTimeout(this.timeoutRef);
	    }
	  }, {
	    key: 'handleClick',
	    value: function handleClick(e) {
	      e.preventDefault();

	      var fun = this.props.fun;
	      var threshold = $(_react2.default.findDOMNode(this.refs.thresholdInput)).val();
	      var limit = $(_react2.default.findDOMNode(this.refs.limitInput)).val();

	      $.ajax({
	        url: "/api/capture",
	        data: {
	          mod: fun[0], fun: fun[1], arity: fun[2],
	          threshold: threshold,
	          limit: limit
	        }
	      }).success(function (e) {
	        this.state.capture_id = e.capture_id;
	        this.state.offset = 0;
	        this.setState(this.state);
	        this.getCaptureData();
	      }.bind(this));
	    }
	  }, {
	    key: 'handleRowExpandClick',
	    value: function handleRowExpandClick(ref, e) {
	      e.preventDefault();
	      var target_row = _react2.default.findDOMNode(this.refs[ref]);

	      if ($(target_row).data("expanded")) {
	        $(target_row).data("expanded", false);
	        $(target_row).removeClass("row-expanded");
	        $(target_row).addClass("row-normal");
	        $(".expand-chevron", target_row).removeClass("glyphicon-chevron-down");
	        $(".expand-chevron", target_row).addClass("glyphicon-chevron-right");
	      } else {
	        $(target_row).data("expanded", true);
	        $(target_row).removeClass("row-normal");
	        $(target_row).addClass("row-expanded");
	        $(".expand-chevron", target_row).removeClass("glyphicon-chevron-right");
	        $(".expand-chevron", target_row).addClass("glyphicon-chevron-down");
	      }
	    }
	  }, {
	    key: 'getCaptureData',
	    value: function getCaptureData() {
	      var fun = this.props.fun;

	      $.ajax({
	        url: "/api/capture_data",
	        data: {
	          mod: fun[0], fun: fun[1], arity: fun[2],
	          offset: this.state.offset
	        }
	      }).success(function (e) {
	        var sortedItems = e.items.sort();
	        var lastId = sortedItems.length == 0 ? this.state.offset : _.last(sortedItems).id;

	        this.state.threshold = e.threshold;

	        if (this.state.capture_id == e.capture_id) {
	          Array.prototype.push.apply(this.state.items, sortedItems);
	          this.state.offset = lastId;
	        } else {
	          this.state.capture_id = e.capture_id;
	          this.state.offset = lastId;
	          this.state.items = sortedItems;
	        }

	        this.setState(this.state);
	      }.bind(this)).done(function () {
	        this.state.timeoutRef = setTimeout(this.getCaptureData.bind(this), 1000);
	      }.bind(this));
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var items = [];
	      for (var i = 0; i < this.state.items.length; i++) {
	        var item = this.state.items[i];
	        var ref = this.state.capture_id + "_" + item.id;
	        items.push(_react2.default.createElement(
	          'tr',
	          { key: ref, ref: ref, 'data-expanded': 'false', className: 'row-normal' },
	          _react2.default.createElement(
	            'td',
	            null,
	            _react2.default.createElement(
	              'button',
	              { onClick: this.handleRowExpandClick.bind(this, ref), type: 'button',
	                className: 'btn btn-default' },
	              _react2.default.createElement('span', { className: 'expand-chevron glyphicon glyphicon-chevron-right',
	                'aria-hidden': 'true' })
	            )
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            item.id
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            item.call_time,
	            ' us'
	          ),
	          _react2.default.createElement(
	            'td',
	            null,
	            item.pid
	          ),
	          _react2.default.createElement(
	            'td',
	            { style: { maxWidth: "500px" } },
	            _react2.default.createElement(
	              'div',
	              { className: 'code-longbox',
	                style: { margin: 0 } },
	              item.args
	            )
	          ),
	          _react2.default.createElement(
	            'td',
	            { style: { maxWidth: "500px" } },
	            _react2.default.createElement(
	              'div',
	              { className: 'code-longbox',
	                style: { margin: 0 } },
	              item.res
	            )
	          )
	        ));
	      }

	      var table = "";
	      if (items.length > 0) {
	        table = _react2.default.createElement(
	          'table',
	          { className: 'table table-hover table-striped' },
	          _react2.default.createElement(
	            'thead',
	            null,
	            _react2.default.createElement('th', null),
	            _react2.default.createElement(
	              'th',
	              null,
	              'Id'
	            ),
	            _react2.default.createElement(
	              'th',
	              null,
	              'Call time'
	            ),
	            _react2.default.createElement(
	              'th',
	              null,
	              'Pid'
	            ),
	            _react2.default.createElement(
	              'th',
	              null,
	              'Args'
	            ),
	            _react2.default.createElement(
	              'th',
	              null,
	              'Response'
	            )
	          ),
	          _react2.default.createElement(
	            'tbody',
	            null,
	            items
	          )
	        );
	      }

	      return _react2.default.createElement(
	        'div',
	        { className: 'panel panel-default' },
	        _react2.default.createElement(
	          'div',
	          { className: 'panel-heading' },
	          'Slow calls tracing'
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'panel-body' },
	          _react2.default.createElement(
	            'form',
	            { className: 'form-inline' },
	            _react2.default.createElement(
	              'div',
	              { className: 'form-group' },
	              _react2.default.createElement(
	                'div',
	                { className: 'input-group' },
	                _react2.default.createElement(
	                  'div',
	                  { className: 'input-group-addon' },
	                  'Treshold'
	                ),
	                _react2.default.createElement('input', { ref: 'thresholdInput', type: 'text', className: 'form-control',
	                  id: 'tresholdInput', placeholder: '100' }),
	                _react2.default.createElement(
	                  'div',
	                  { className: 'input-group-addon' },
	                  'ms'
	                )
	              )
	            ),
	            _react2.default.createElement(
	              'span',
	              null,
	              '   '
	            ),
	            _react2.default.createElement(
	              'div',
	              { className: 'form-group' },
	              _react2.default.createElement(
	                'div',
	                { className: 'input-group' },
	                _react2.default.createElement(
	                  'div',
	                  { className: 'input-group-addon' },
	                  'Limit'
	                ),
	                _react2.default.createElement('input', { ref: 'limitInput', type: 'text', className: 'form-control',
	                  id: 'limitInput', placeholder: '2' }),
	                _react2.default.createElement(
	                  'div',
	                  { className: 'input-group-addon' },
	                  'calls'
	                )
	              )
	            ),
	            _react2.default.createElement(
	              'span',
	              null,
	              '   '
	            ),
	            _react2.default.createElement(
	              'button',
	              { type: 'submit', onClick: this.handleClick.bind(this),
	                className: 'btn btn-primary' },
	              'Catch'
	            )
	          )
	        ),
	        table
	      );
	    }
	  }]);

	  return CallsTracer;
	}(_react2.default.Component);

	exports.default = CallsTracer;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(9)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(2);

	__webpack_require__(12);

	__webpack_require__(4);

	var _graph = __webpack_require__(8);

	var _graph2 = _interopRequireDefault(_graph);

	var _tracing_switch = __webpack_require__(21);

	var _tracing_switch2 = _interopRequireDefault(_tracing_switch);

	var _graph_panel = __webpack_require__(22);

	var _graph_panel2 = _interopRequireDefault(_graph_panel);

	var _function_browser = __webpack_require__(23);

	var _function_browser2 = _interopRequireDefault(_function_browser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var App = function (_React$Component) {
	  _inherits(App, _React$Component);

	  function App(props) {
	    _classCallCheck(this, App);

	    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));
	  }

	  _createClass(App, [{
	    key: 'addGraph',
	    value: function addGraph(query) {
	      this.refs.graphPanel.addGraph(query);
	    }
	  }, {
	    key: 'clearFunctionBrowser',
	    value: function clearFunctionBrowser() {
	      this.refs.functionBrowser.clear();
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'container-fluid' },
	        _react2.default.createElement(
	          'nav',
	          { className: 'navbar navbar-default navbar-fixed-top' },
	          _react2.default.createElement(
	            'div',
	            { className: 'navbar-header' },
	            _react2.default.createElement(
	              'a',
	              { className: 'navbar-brand', href: '#' },
	              _react2.default.createElement('img', { src: 'img/xprof_logo.png', height: '45px' })
	            )
	          ),
	          _react2.default.createElement(
	            'div',
	            { className: 'navbar-collapse collapse', id: 'navbar-collapsible' },
	            _react2.default.createElement(_tracing_switch2.default, null),
	            _react2.default.createElement(_function_browser2.default, { ref: 'functionBrowser', addGraph: this.addGraph.bind(this) })
	          )
	        ),
	        _react2.default.createElement(_graph_panel2.default, { ref: 'graphPanel', clearFunctionBrowser: this.clearFunctionBrowser.bind(this) })
	      );
	    }
	  }]);

	  return App;
	}(_react2.default.Component);

	_react2.default.render(_react2.default.createElement(App, null), document.getElementById('main-container'));

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(20)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./bootstrap.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./bootstrap.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(14)();
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Lato:400,700,400italic);", ""]);

	// module
	exports.push([module.id, "/*!\n * bootswatch v3.3.7\n * Homepage: http://bootswatch.com\n * Copyright 2012-2016 Thomas Park\n * Licensed under MIT\n * Based on Bootstrap\n*/\n/*!\n * Bootstrap v3.3.7 (http://getbootstrap.com)\n * Copyright 2011-2016 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\nhtml {\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n}\nbody {\n  margin: 0;\n}\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block;\n}\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline;\n}\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n[hidden],\ntemplate {\n  display: none;\n}\na {\n  background-color: transparent;\n}\na:active,\na:hover {\n  outline: 0;\n}\nabbr[title] {\n  border-bottom: 1px dotted;\n}\nb,\nstrong {\n  font-weight: bold;\n}\ndfn {\n  font-style: italic;\n}\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\nmark {\n  background: #ff0;\n  color: #000;\n}\nsmall {\n  font-size: 80%;\n}\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\nsup {\n  top: -0.5em;\n}\nsub {\n  bottom: -0.25em;\n}\nimg {\n  border: 0;\n}\nsvg:not(:root) {\n  overflow: hidden;\n}\nfigure {\n  margin: 1em 40px;\n}\nhr {\n  -webkit-box-sizing: content-box;\n     -moz-box-sizing: content-box;\n          box-sizing: content-box;\n  height: 0;\n}\npre {\n  overflow: auto;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit;\n  font: inherit;\n  margin: 0;\n}\nbutton {\n  overflow: visible;\n}\nbutton,\nselect {\n  text-transform: none;\n}\nbutton,\nhtml input[type=\"button\"],\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer;\n}\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default;\n}\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0;\n}\ninput {\n  line-height: normal;\n}\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  -webkit-box-sizing: border-box;\n     -moz-box-sizing: border-box;\n          box-sizing: border-box;\n  padding: 0;\n}\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\ninput[type=\"search\"] {\n  -webkit-appearance: textfield;\n  -webkit-box-sizing: content-box;\n     -moz-box-sizing: content-box;\n          box-sizing: content-box;\n}\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\nlegend {\n  border: 0;\n  padding: 0;\n}\ntextarea {\n  overflow: auto;\n}\noptgroup {\n  font-weight: bold;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\ntd,\nth {\n  padding: 0;\n}\n/*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */\n@media print {\n  *,\n  *:before,\n  *:after {\n    background: transparent !important;\n    color: #000 !important;\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n    text-shadow: none !important;\n  }\n  a,\n  a:visited {\n    text-decoration: underline;\n  }\n  a[href]:after {\n    content: \" (\" attr(href) \")\";\n  }\n  abbr[title]:after {\n    content: \" (\" attr(title) \")\";\n  }\n  a[href^=\"#\"]:after,\n  a[href^=\"javascript:\"]:after {\n    content: \"\";\n  }\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid;\n  }\n  thead {\n    display: table-header-group;\n  }\n  tr,\n  img {\n    page-break-inside: avoid;\n  }\n  img {\n    max-width: 100% !important;\n  }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n  }\n  h2,\n  h3 {\n    page-break-after: avoid;\n  }\n  .navbar {\n    display: none;\n  }\n  .btn > .caret,\n  .dropup > .btn > .caret {\n    border-top-color: #000 !important;\n  }\n  .label {\n    border: 1px solid #000;\n  }\n  .table {\n    border-collapse: collapse !important;\n  }\n  .table td,\n  .table th {\n    background-color: #fff !important;\n  }\n  .table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important;\n  }\n}\n@font-face {\n  font-family: 'Glyphicons Halflings';\n  src: url(" + __webpack_require__(15) + ");\n  src: url(" + __webpack_require__(15) + "?#iefix) format('embedded-opentype'), url(" + __webpack_require__(16) + ") format('woff2'), url(" + __webpack_require__(17) + ") format('woff'), url(" + __webpack_require__(18) + ") format('truetype'), url(" + __webpack_require__(19) + "#glyphicons_halflingsregular) format('svg');\n}\n.glyphicon {\n  position: relative;\n  top: 1px;\n  display: inline-block;\n  font-family: 'Glyphicons Halflings';\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.glyphicon-asterisk:before {\n  content: \"*\";\n}\n.glyphicon-plus:before {\n  content: \"+\";\n}\n.glyphicon-euro:before,\n.glyphicon-eur:before {\n  content: \"\\20AC\";\n}\n.glyphicon-minus:before {\n  content: \"\\2212\";\n}\n.glyphicon-cloud:before {\n  content: \"\\2601\";\n}\n.glyphicon-envelope:before {\n  content: \"\\2709\";\n}\n.glyphicon-pencil:before {\n  content: \"\\270F\";\n}\n.glyphicon-glass:before {\n  content: \"\\E001\";\n}\n.glyphicon-music:before {\n  content: \"\\E002\";\n}\n.glyphicon-search:before {\n  content: \"\\E003\";\n}\n.glyphicon-heart:before {\n  content: \"\\E005\";\n}\n.glyphicon-star:before {\n  content: \"\\E006\";\n}\n.glyphicon-star-empty:before {\n  content: \"\\E007\";\n}\n.glyphicon-user:before {\n  content: \"\\E008\";\n}\n.glyphicon-film:before {\n  content: \"\\E009\";\n}\n.glyphicon-th-large:before {\n  content: \"\\E010\";\n}\n.glyphicon-th:before {\n  content: \"\\E011\";\n}\n.glyphicon-th-list:before {\n  content: \"\\E012\";\n}\n.glyphicon-ok:before {\n  content: \"\\E013\";\n}\n.glyphicon-remove:before {\n  content: \"\\E014\";\n}\n.glyphicon-zoom-in:before {\n  content: \"\\E015\";\n}\n.glyphicon-zoom-out:before {\n  content: \"\\E016\";\n}\n.glyphicon-off:before {\n  content: \"\\E017\";\n}\n.glyphicon-signal:before {\n  content: \"\\E018\";\n}\n.glyphicon-cog:before {\n  content: \"\\E019\";\n}\n.glyphicon-trash:before {\n  content: \"\\E020\";\n}\n.glyphicon-home:before {\n  content: \"\\E021\";\n}\n.glyphicon-file:before {\n  content: \"\\E022\";\n}\n.glyphicon-time:before {\n  content: \"\\E023\";\n}\n.glyphicon-road:before {\n  content: \"\\E024\";\n}\n.glyphicon-download-alt:before {\n  content: \"\\E025\";\n}\n.glyphicon-download:before {\n  content: \"\\E026\";\n}\n.glyphicon-upload:before {\n  content: \"\\E027\";\n}\n.glyphicon-inbox:before {\n  content: \"\\E028\";\n}\n.glyphicon-play-circle:before {\n  content: \"\\E029\";\n}\n.glyphicon-repeat:before {\n  content: \"\\E030\";\n}\n.glyphicon-refresh:before {\n  content: \"\\E031\";\n}\n.glyphicon-list-alt:before {\n  content: \"\\E032\";\n}\n.glyphicon-lock:before {\n  content: \"\\E033\";\n}\n.glyphicon-flag:before {\n  content: \"\\E034\";\n}\n.glyphicon-headphones:before {\n  content: \"\\E035\";\n}\n.glyphicon-volume-off:before {\n  content: \"\\E036\";\n}\n.glyphicon-volume-down:before {\n  content: \"\\E037\";\n}\n.glyphicon-volume-up:before {\n  content: \"\\E038\";\n}\n.glyphicon-qrcode:before {\n  content: \"\\E039\";\n}\n.glyphicon-barcode:before {\n  content: \"\\E040\";\n}\n.glyphicon-tag:before {\n  content: \"\\E041\";\n}\n.glyphicon-tags:before {\n  content: \"\\E042\";\n}\n.glyphicon-book:before {\n  content: \"\\E043\";\n}\n.glyphicon-bookmark:before {\n  content: \"\\E044\";\n}\n.glyphicon-print:before {\n  content: \"\\E045\";\n}\n.glyphicon-camera:before {\n  content: \"\\E046\";\n}\n.glyphicon-font:before {\n  content: \"\\E047\";\n}\n.glyphicon-bold:before {\n  content: \"\\E048\";\n}\n.glyphicon-italic:before {\n  content: \"\\E049\";\n}\n.glyphicon-text-height:before {\n  content: \"\\E050\";\n}\n.glyphicon-text-width:before {\n  content: \"\\E051\";\n}\n.glyphicon-align-left:before {\n  content: \"\\E052\";\n}\n.glyphicon-align-center:before {\n  content: \"\\E053\";\n}\n.glyphicon-align-right:before {\n  content: \"\\E054\";\n}\n.glyphicon-align-justify:before {\n  content: \"\\E055\";\n}\n.glyphicon-list:before {\n  content: \"\\E056\";\n}\n.glyphicon-indent-left:before {\n  content: \"\\E057\";\n}\n.glyphicon-indent-right:before {\n  content: \"\\E058\";\n}\n.glyphicon-facetime-video:before {\n  content: \"\\E059\";\n}\n.glyphicon-picture:before {\n  content: \"\\E060\";\n}\n.glyphicon-map-marker:before {\n  content: \"\\E062\";\n}\n.glyphicon-adjust:before {\n  content: \"\\E063\";\n}\n.glyphicon-tint:before {\n  content: \"\\E064\";\n}\n.glyphicon-edit:before {\n  content: \"\\E065\";\n}\n.glyphicon-share:before {\n  content: \"\\E066\";\n}\n.glyphicon-check:before {\n  content: \"\\E067\";\n}\n.glyphicon-move:before {\n  content: \"\\E068\";\n}\n.glyphicon-step-backward:before {\n  content: \"\\E069\";\n}\n.glyphicon-fast-backward:before {\n  content: \"\\E070\";\n}\n.glyphicon-backward:before {\n  content: \"\\E071\";\n}\n.glyphicon-play:before {\n  content: \"\\E072\";\n}\n.glyphicon-pause:before {\n  content: \"\\E073\";\n}\n.glyphicon-stop:before {\n  content: \"\\E074\";\n}\n.glyphicon-forward:before {\n  content: \"\\E075\";\n}\n.glyphicon-fast-forward:before {\n  content: \"\\E076\";\n}\n.glyphicon-step-forward:before {\n  content: \"\\E077\";\n}\n.glyphicon-eject:before {\n  content: \"\\E078\";\n}\n.glyphicon-chevron-left:before {\n  content: \"\\E079\";\n}\n.glyphicon-chevron-right:before {\n  content: \"\\E080\";\n}\n.glyphicon-plus-sign:before {\n  content: \"\\E081\";\n}\n.glyphicon-minus-sign:before {\n  content: \"\\E082\";\n}\n.glyphicon-remove-sign:before {\n  content: \"\\E083\";\n}\n.glyphicon-ok-sign:before {\n  content: \"\\E084\";\n}\n.glyphicon-question-sign:before {\n  content: \"\\E085\";\n}\n.glyphicon-info-sign:before {\n  content: \"\\E086\";\n}\n.glyphicon-screenshot:before {\n  content: \"\\E087\";\n}\n.glyphicon-remove-circle:before {\n  content: \"\\E088\";\n}\n.glyphicon-ok-circle:before {\n  content: \"\\E089\";\n}\n.glyphicon-ban-circle:before {\n  content: \"\\E090\";\n}\n.glyphicon-arrow-left:before {\n  content: \"\\E091\";\n}\n.glyphicon-arrow-right:before {\n  content: \"\\E092\";\n}\n.glyphicon-arrow-up:before {\n  content: \"\\E093\";\n}\n.glyphicon-arrow-down:before {\n  content: \"\\E094\";\n}\n.glyphicon-share-alt:before {\n  content: \"\\E095\";\n}\n.glyphicon-resize-full:before {\n  content: \"\\E096\";\n}\n.glyphicon-resize-small:before {\n  content: \"\\E097\";\n}\n.glyphicon-exclamation-sign:before {\n  content: \"\\E101\";\n}\n.glyphicon-gift:before {\n  content: \"\\E102\";\n}\n.glyphicon-leaf:before {\n  content: \"\\E103\";\n}\n.glyphicon-fire:before {\n  content: \"\\E104\";\n}\n.glyphicon-eye-open:before {\n  content: \"\\E105\";\n}\n.glyphicon-eye-close:before {\n  content: \"\\E106\";\n}\n.glyphicon-warning-sign:before {\n  content: \"\\E107\";\n}\n.glyphicon-plane:before {\n  content: \"\\E108\";\n}\n.glyphicon-calendar:before {\n  content: \"\\E109\";\n}\n.glyphicon-random:before {\n  content: \"\\E110\";\n}\n.glyphicon-comment:before {\n  content: \"\\E111\";\n}\n.glyphicon-magnet:before {\n  content: \"\\E112\";\n}\n.glyphicon-chevron-up:before {\n  content: \"\\E113\";\n}\n.glyphicon-chevron-down:before {\n  content: \"\\E114\";\n}\n.glyphicon-retweet:before {\n  content: \"\\E115\";\n}\n.glyphicon-shopping-cart:before {\n  content: \"\\E116\";\n}\n.glyphicon-folder-close:before {\n  content: \"\\E117\";\n}\n.glyphicon-folder-open:before {\n  content: \"\\E118\";\n}\n.glyphicon-resize-vertical:before {\n  content: \"\\E119\";\n}\n.glyphicon-resize-horizontal:before {\n  content: \"\\E120\";\n}\n.glyphicon-hdd:before {\n  content: \"\\E121\";\n}\n.glyphicon-bullhorn:before {\n  content: \"\\E122\";\n}\n.glyphicon-bell:before {\n  content: \"\\E123\";\n}\n.glyphicon-certificate:before {\n  content: \"\\E124\";\n}\n.glyphicon-thumbs-up:before {\n  content: \"\\E125\";\n}\n.glyphicon-thumbs-down:before {\n  content: \"\\E126\";\n}\n.glyphicon-hand-right:before {\n  content: \"\\E127\";\n}\n.glyphicon-hand-left:before {\n  content: \"\\E128\";\n}\n.glyphicon-hand-up:before {\n  content: \"\\E129\";\n}\n.glyphicon-hand-down:before {\n  content: \"\\E130\";\n}\n.glyphicon-circle-arrow-right:before {\n  content: \"\\E131\";\n}\n.glyphicon-circle-arrow-left:before {\n  content: \"\\E132\";\n}\n.glyphicon-circle-arrow-up:before {\n  content: \"\\E133\";\n}\n.glyphicon-circle-arrow-down:before {\n  content: \"\\E134\";\n}\n.glyphicon-globe:before {\n  content: \"\\E135\";\n}\n.glyphicon-wrench:before {\n  content: \"\\E136\";\n}\n.glyphicon-tasks:before {\n  content: \"\\E137\";\n}\n.glyphicon-filter:before {\n  content: \"\\E138\";\n}\n.glyphicon-briefcase:before {\n  content: \"\\E139\";\n}\n.glyphicon-fullscreen:before {\n  content: \"\\E140\";\n}\n.glyphicon-dashboard:before {\n  content: \"\\E141\";\n}\n.glyphicon-paperclip:before {\n  content: \"\\E142\";\n}\n.glyphicon-heart-empty:before {\n  content: \"\\E143\";\n}\n.glyphicon-link:before {\n  content: \"\\E144\";\n}\n.glyphicon-phone:before {\n  content: \"\\E145\";\n}\n.glyphicon-pushpin:before {\n  content: \"\\E146\";\n}\n.glyphicon-usd:before {\n  content: \"\\E148\";\n}\n.glyphicon-gbp:before {\n  content: \"\\E149\";\n}\n.glyphicon-sort:before {\n  content: \"\\E150\";\n}\n.glyphicon-sort-by-alphabet:before {\n  content: \"\\E151\";\n}\n.glyphicon-sort-by-alphabet-alt:before {\n  content: \"\\E152\";\n}\n.glyphicon-sort-by-order:before {\n  content: \"\\E153\";\n}\n.glyphicon-sort-by-order-alt:before {\n  content: \"\\E154\";\n}\n.glyphicon-sort-by-attributes:before {\n  content: \"\\E155\";\n}\n.glyphicon-sort-by-attributes-alt:before {\n  content: \"\\E156\";\n}\n.glyphicon-unchecked:before {\n  content: \"\\E157\";\n}\n.glyphicon-expand:before {\n  content: \"\\E158\";\n}\n.glyphicon-collapse-down:before {\n  content: \"\\E159\";\n}\n.glyphicon-collapse-up:before {\n  content: \"\\E160\";\n}\n.glyphicon-log-in:before {\n  content: \"\\E161\";\n}\n.glyphicon-flash:before {\n  content: \"\\E162\";\n}\n.glyphicon-log-out:before {\n  content: \"\\E163\";\n}\n.glyphicon-new-window:before {\n  content: \"\\E164\";\n}\n.glyphicon-record:before {\n  content: \"\\E165\";\n}\n.glyphicon-save:before {\n  content: \"\\E166\";\n}\n.glyphicon-open:before {\n  content: \"\\E167\";\n}\n.glyphicon-saved:before {\n  content: \"\\E168\";\n}\n.glyphicon-import:before {\n  content: \"\\E169\";\n}\n.glyphicon-export:before {\n  content: \"\\E170\";\n}\n.glyphicon-send:before {\n  content: \"\\E171\";\n}\n.glyphicon-floppy-disk:before {\n  content: \"\\E172\";\n}\n.glyphicon-floppy-saved:before {\n  content: \"\\E173\";\n}\n.glyphicon-floppy-remove:before {\n  content: \"\\E174\";\n}\n.glyphicon-floppy-save:before {\n  content: \"\\E175\";\n}\n.glyphicon-floppy-open:before {\n  content: \"\\E176\";\n}\n.glyphicon-credit-card:before {\n  content: \"\\E177\";\n}\n.glyphicon-transfer:before {\n  content: \"\\E178\";\n}\n.glyphicon-cutlery:before {\n  content: \"\\E179\";\n}\n.glyphicon-header:before {\n  content: \"\\E180\";\n}\n.glyphicon-compressed:before {\n  content: \"\\E181\";\n}\n.glyphicon-earphone:before {\n  content: \"\\E182\";\n}\n.glyphicon-phone-alt:before {\n  content: \"\\E183\";\n}\n.glyphicon-tower:before {\n  content: \"\\E184\";\n}\n.glyphicon-stats:before {\n  content: \"\\E185\";\n}\n.glyphicon-sd-video:before {\n  content: \"\\E186\";\n}\n.glyphicon-hd-video:before {\n  content: \"\\E187\";\n}\n.glyphicon-subtitles:before {\n  content: \"\\E188\";\n}\n.glyphicon-sound-stereo:before {\n  content: \"\\E189\";\n}\n.glyphicon-sound-dolby:before {\n  content: \"\\E190\";\n}\n.glyphicon-sound-5-1:before {\n  content: \"\\E191\";\n}\n.glyphicon-sound-6-1:before {\n  content: \"\\E192\";\n}\n.glyphicon-sound-7-1:before {\n  content: \"\\E193\";\n}\n.glyphicon-copyright-mark:before {\n  content: \"\\E194\";\n}\n.glyphicon-registration-mark:before {\n  content: \"\\E195\";\n}\n.glyphicon-cloud-download:before {\n  content: \"\\E197\";\n}\n.glyphicon-cloud-upload:before {\n  content: \"\\E198\";\n}\n.glyphicon-tree-conifer:before {\n  content: \"\\E199\";\n}\n.glyphicon-tree-deciduous:before {\n  content: \"\\E200\";\n}\n.glyphicon-cd:before {\n  content: \"\\E201\";\n}\n.glyphicon-save-file:before {\n  content: \"\\E202\";\n}\n.glyphicon-open-file:before {\n  content: \"\\E203\";\n}\n.glyphicon-level-up:before {\n  content: \"\\E204\";\n}\n.glyphicon-copy:before {\n  content: \"\\E205\";\n}\n.glyphicon-paste:before {\n  content: \"\\E206\";\n}\n.glyphicon-alert:before {\n  content: \"\\E209\";\n}\n.glyphicon-equalizer:before {\n  content: \"\\E210\";\n}\n.glyphicon-king:before {\n  content: \"\\E211\";\n}\n.glyphicon-queen:before {\n  content: \"\\E212\";\n}\n.glyphicon-pawn:before {\n  content: \"\\E213\";\n}\n.glyphicon-bishop:before {\n  content: \"\\E214\";\n}\n.glyphicon-knight:before {\n  content: \"\\E215\";\n}\n.glyphicon-baby-formula:before {\n  content: \"\\E216\";\n}\n.glyphicon-tent:before {\n  content: \"\\26FA\";\n}\n.glyphicon-blackboard:before {\n  content: \"\\E218\";\n}\n.glyphicon-bed:before {\n  content: \"\\E219\";\n}\n.glyphicon-apple:before {\n  content: \"\\F8FF\";\n}\n.glyphicon-erase:before {\n  content: \"\\E221\";\n}\n.glyphicon-hourglass:before {\n  content: \"\\231B\";\n}\n.glyphicon-lamp:before {\n  content: \"\\E223\";\n}\n.glyphicon-duplicate:before {\n  content: \"\\E224\";\n}\n.glyphicon-piggy-bank:before {\n  content: \"\\E225\";\n}\n.glyphicon-scissors:before {\n  content: \"\\E226\";\n}\n.glyphicon-bitcoin:before {\n  content: \"\\E227\";\n}\n.glyphicon-btc:before {\n  content: \"\\E227\";\n}\n.glyphicon-xbt:before {\n  content: \"\\E227\";\n}\n.glyphicon-yen:before {\n  content: \"\\A5\";\n}\n.glyphicon-jpy:before {\n  content: \"\\A5\";\n}\n.glyphicon-ruble:before {\n  content: \"\\20BD\";\n}\n.glyphicon-rub:before {\n  content: \"\\20BD\";\n}\n.glyphicon-scale:before {\n  content: \"\\E230\";\n}\n.glyphicon-ice-lolly:before {\n  content: \"\\E231\";\n}\n.glyphicon-ice-lolly-tasted:before {\n  content: \"\\E232\";\n}\n.glyphicon-education:before {\n  content: \"\\E233\";\n}\n.glyphicon-option-horizontal:before {\n  content: \"\\E234\";\n}\n.glyphicon-option-vertical:before {\n  content: \"\\E235\";\n}\n.glyphicon-menu-hamburger:before {\n  content: \"\\E236\";\n}\n.glyphicon-modal-window:before {\n  content: \"\\E237\";\n}\n.glyphicon-oil:before {\n  content: \"\\E238\";\n}\n.glyphicon-grain:before {\n  content: \"\\E239\";\n}\n.glyphicon-sunglasses:before {\n  content: \"\\E240\";\n}\n.glyphicon-text-size:before {\n  content: \"\\E241\";\n}\n.glyphicon-text-color:before {\n  content: \"\\E242\";\n}\n.glyphicon-text-background:before {\n  content: \"\\E243\";\n}\n.glyphicon-object-align-top:before {\n  content: \"\\E244\";\n}\n.glyphicon-object-align-bottom:before {\n  content: \"\\E245\";\n}\n.glyphicon-object-align-horizontal:before {\n  content: \"\\E246\";\n}\n.glyphicon-object-align-left:before {\n  content: \"\\E247\";\n}\n.glyphicon-object-align-vertical:before {\n  content: \"\\E248\";\n}\n.glyphicon-object-align-right:before {\n  content: \"\\E249\";\n}\n.glyphicon-triangle-right:before {\n  content: \"\\E250\";\n}\n.glyphicon-triangle-left:before {\n  content: \"\\E251\";\n}\n.glyphicon-triangle-bottom:before {\n  content: \"\\E252\";\n}\n.glyphicon-triangle-top:before {\n  content: \"\\E253\";\n}\n.glyphicon-console:before {\n  content: \"\\E254\";\n}\n.glyphicon-superscript:before {\n  content: \"\\E255\";\n}\n.glyphicon-subscript:before {\n  content: \"\\E256\";\n}\n.glyphicon-menu-left:before {\n  content: \"\\E257\";\n}\n.glyphicon-menu-right:before {\n  content: \"\\E258\";\n}\n.glyphicon-menu-down:before {\n  content: \"\\E259\";\n}\n.glyphicon-menu-up:before {\n  content: \"\\E260\";\n}\n* {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n*:before,\n*:after {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\nhtml {\n  font-size: 10px;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\nbody {\n  font-family: \"Lato\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1.42857143;\n  color: #2c3e50;\n  background-color: #ffffff;\n}\ninput,\nbutton,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\na {\n  color: #18bc9c;\n  text-decoration: none;\n}\na:hover,\na:focus {\n  color: #18bc9c;\n  text-decoration: underline;\n}\na:focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\nfigure {\n  margin: 0;\n}\nimg {\n  vertical-align: middle;\n}\n.img-responsive,\n.thumbnail > img,\n.thumbnail a > img,\n.carousel-inner > .item > img,\n.carousel-inner > .item > a > img {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n.img-rounded {\n  border-radius: 6px;\n}\n.img-thumbnail {\n  padding: 4px;\n  line-height: 1.42857143;\n  background-color: #ffffff;\n  border: 1px solid #ecf0f1;\n  border-radius: 4px;\n  -webkit-transition: all 0.2s ease-in-out;\n  -o-transition: all 0.2s ease-in-out;\n  transition: all 0.2s ease-in-out;\n  display: inline-block;\n  max-width: 100%;\n  height: auto;\n}\n.img-circle {\n  border-radius: 50%;\n}\nhr {\n  margin-top: 21px;\n  margin-bottom: 21px;\n  border: 0;\n  border-top: 1px solid #ecf0f1;\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n}\n[role=\"button\"] {\n  cursor: pointer;\n}\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  font-family: \"Lato\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-weight: 400;\n  line-height: 1.1;\n  color: inherit;\n}\nh1 small,\nh2 small,\nh3 small,\nh4 small,\nh5 small,\nh6 small,\n.h1 small,\n.h2 small,\n.h3 small,\n.h4 small,\n.h5 small,\n.h6 small,\nh1 .small,\nh2 .small,\nh3 .small,\nh4 .small,\nh5 .small,\nh6 .small,\n.h1 .small,\n.h2 .small,\n.h3 .small,\n.h4 .small,\n.h5 .small,\n.h6 .small {\n  font-weight: normal;\n  line-height: 1;\n  color: #b4bcc2;\n}\nh1,\n.h1,\nh2,\n.h2,\nh3,\n.h3 {\n  margin-top: 21px;\n  margin-bottom: 10.5px;\n}\nh1 small,\n.h1 small,\nh2 small,\n.h2 small,\nh3 small,\n.h3 small,\nh1 .small,\n.h1 .small,\nh2 .small,\n.h2 .small,\nh3 .small,\n.h3 .small {\n  font-size: 65%;\n}\nh4,\n.h4,\nh5,\n.h5,\nh6,\n.h6 {\n  margin-top: 10.5px;\n  margin-bottom: 10.5px;\n}\nh4 small,\n.h4 small,\nh5 small,\n.h5 small,\nh6 small,\n.h6 small,\nh4 .small,\n.h4 .small,\nh5 .small,\n.h5 .small,\nh6 .small,\n.h6 .small {\n  font-size: 75%;\n}\nh1,\n.h1 {\n  font-size: 39px;\n}\nh2,\n.h2 {\n  font-size: 32px;\n}\nh3,\n.h3 {\n  font-size: 26px;\n}\nh4,\n.h4 {\n  font-size: 19px;\n}\nh5,\n.h5 {\n  font-size: 15px;\n}\nh6,\n.h6 {\n  font-size: 13px;\n}\np {\n  margin: 0 0 10.5px;\n}\n.lead {\n  margin-bottom: 21px;\n  font-size: 17px;\n  font-weight: 300;\n  line-height: 1.4;\n}\n@media (min-width: 768px) {\n  .lead {\n    font-size: 22.5px;\n  }\n}\nsmall,\n.small {\n  font-size: 86%;\n}\nmark,\n.mark {\n  background-color: #f39c12;\n  padding: .2em;\n}\n.text-left {\n  text-align: left;\n}\n.text-right {\n  text-align: right;\n}\n.text-center {\n  text-align: center;\n}\n.text-justify {\n  text-align: justify;\n}\n.text-nowrap {\n  white-space: nowrap;\n}\n.text-lowercase {\n  text-transform: lowercase;\n}\n.text-uppercase {\n  text-transform: uppercase;\n}\n.text-capitalize {\n  text-transform: capitalize;\n}\n.text-muted {\n  color: #b4bcc2;\n}\n.text-primary {\n  color: #2c3e50;\n}\na.text-primary:hover,\na.text-primary:focus {\n  color: #1a242f;\n}\n.text-success {\n  color: #ffffff;\n}\na.text-success:hover,\na.text-success:focus {\n  color: #e6e6e6;\n}\n.text-info {\n  color: #ffffff;\n}\na.text-info:hover,\na.text-info:focus {\n  color: #e6e6e6;\n}\n.text-warning {\n  color: #ffffff;\n}\na.text-warning:hover,\na.text-warning:focus {\n  color: #e6e6e6;\n}\n.text-danger {\n  color: #ffffff;\n}\na.text-danger:hover,\na.text-danger:focus {\n  color: #e6e6e6;\n}\n.bg-primary {\n  color: #fff;\n  background-color: #2c3e50;\n}\na.bg-primary:hover,\na.bg-primary:focus {\n  background-color: #1a242f;\n}\n.bg-success {\n  background-color: #18bc9c;\n}\na.bg-success:hover,\na.bg-success:focus {\n  background-color: #128f76;\n}\n.bg-info {\n  background-color: #3498db;\n}\na.bg-info:hover,\na.bg-info:focus {\n  background-color: #217dbb;\n}\n.bg-warning {\n  background-color: #f39c12;\n}\na.bg-warning:hover,\na.bg-warning:focus {\n  background-color: #c87f0a;\n}\n.bg-danger {\n  background-color: #e74c3c;\n}\na.bg-danger:hover,\na.bg-danger:focus {\n  background-color: #d62c1a;\n}\n.page-header {\n  padding-bottom: 9.5px;\n  margin: 42px 0 21px;\n  border-bottom: 1px solid transparent;\n}\nul,\nol {\n  margin-top: 0;\n  margin-bottom: 10.5px;\n}\nul ul,\nol ul,\nul ol,\nol ol {\n  margin-bottom: 0;\n}\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n  margin-left: -5px;\n}\n.list-inline > li {\n  display: inline-block;\n  padding-left: 5px;\n  padding-right: 5px;\n}\ndl {\n  margin-top: 0;\n  margin-bottom: 21px;\n}\ndt,\ndd {\n  line-height: 1.42857143;\n}\ndt {\n  font-weight: bold;\n}\ndd {\n  margin-left: 0;\n}\n@media (min-width: 768px) {\n  .dl-horizontal dt {\n    float: left;\n    width: 160px;\n    clear: left;\n    text-align: right;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .dl-horizontal dd {\n    margin-left: 180px;\n  }\n}\nabbr[title],\nabbr[data-original-title] {\n  cursor: help;\n  border-bottom: 1px dotted #b4bcc2;\n}\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\nblockquote {\n  padding: 10.5px 21px;\n  margin: 0 0 21px;\n  font-size: 18.75px;\n  border-left: 5px solid #ecf0f1;\n}\nblockquote p:last-child,\nblockquote ul:last-child,\nblockquote ol:last-child {\n  margin-bottom: 0;\n}\nblockquote footer,\nblockquote small,\nblockquote .small {\n  display: block;\n  font-size: 80%;\n  line-height: 1.42857143;\n  color: #b4bcc2;\n}\nblockquote footer:before,\nblockquote small:before,\nblockquote .small:before {\n  content: '\\2014   \\A0';\n}\n.blockquote-reverse,\nblockquote.pull-right {\n  padding-right: 15px;\n  padding-left: 0;\n  border-right: 5px solid #ecf0f1;\n  border-left: 0;\n  text-align: right;\n}\n.blockquote-reverse footer:before,\nblockquote.pull-right footer:before,\n.blockquote-reverse small:before,\nblockquote.pull-right small:before,\n.blockquote-reverse .small:before,\nblockquote.pull-right .small:before {\n  content: '';\n}\n.blockquote-reverse footer:after,\nblockquote.pull-right footer:after,\n.blockquote-reverse small:after,\nblockquote.pull-right small:after,\n.blockquote-reverse .small:after,\nblockquote.pull-right .small:after {\n  content: '\\A0   \\2014';\n}\naddress {\n  margin-bottom: 21px;\n  font-style: normal;\n  line-height: 1.42857143;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace;\n}\ncode {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #c7254e;\n  background-color: #f9f2f4;\n  border-radius: 4px;\n}\nkbd {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #ffffff;\n  background-color: #333333;\n  border-radius: 3px;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);\n          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);\n}\nkbd kbd {\n  padding: 0;\n  font-size: 100%;\n  font-weight: bold;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\npre {\n  display: block;\n  padding: 10px;\n  margin: 0 0 10.5px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  word-break: break-all;\n  word-wrap: break-word;\n  color: #7b8a8b;\n  background-color: #ecf0f1;\n  border: 1px solid #cccccc;\n  border-radius: 4px;\n}\npre code {\n  padding: 0;\n  font-size: inherit;\n  color: inherit;\n  white-space: pre-wrap;\n  background-color: transparent;\n  border-radius: 0;\n}\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n.container {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n@media (min-width: 768px) {\n  .container {\n    width: 750px;\n  }\n}\n@media (min-width: 992px) {\n  .container {\n    width: 970px;\n  }\n}\n@media (min-width: 1200px) {\n  .container {\n    width: 1170px;\n  }\n}\n.container-fluid {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.row {\n  margin-left: -15px;\n  margin-right: -15px;\n}\n.col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\n  position: relative;\n  min-height: 1px;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.col-xs-1, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9, .col-xs-10, .col-xs-11, .col-xs-12 {\n  float: left;\n}\n.col-xs-12 {\n  width: 100%;\n}\n.col-xs-11 {\n  width: 91.66666667%;\n}\n.col-xs-10 {\n  width: 83.33333333%;\n}\n.col-xs-9 {\n  width: 75%;\n}\n.col-xs-8 {\n  width: 66.66666667%;\n}\n.col-xs-7 {\n  width: 58.33333333%;\n}\n.col-xs-6 {\n  width: 50%;\n}\n.col-xs-5 {\n  width: 41.66666667%;\n}\n.col-xs-4 {\n  width: 33.33333333%;\n}\n.col-xs-3 {\n  width: 25%;\n}\n.col-xs-2 {\n  width: 16.66666667%;\n}\n.col-xs-1 {\n  width: 8.33333333%;\n}\n.col-xs-pull-12 {\n  right: 100%;\n}\n.col-xs-pull-11 {\n  right: 91.66666667%;\n}\n.col-xs-pull-10 {\n  right: 83.33333333%;\n}\n.col-xs-pull-9 {\n  right: 75%;\n}\n.col-xs-pull-8 {\n  right: 66.66666667%;\n}\n.col-xs-pull-7 {\n  right: 58.33333333%;\n}\n.col-xs-pull-6 {\n  right: 50%;\n}\n.col-xs-pull-5 {\n  right: 41.66666667%;\n}\n.col-xs-pull-4 {\n  right: 33.33333333%;\n}\n.col-xs-pull-3 {\n  right: 25%;\n}\n.col-xs-pull-2 {\n  right: 16.66666667%;\n}\n.col-xs-pull-1 {\n  right: 8.33333333%;\n}\n.col-xs-pull-0 {\n  right: auto;\n}\n.col-xs-push-12 {\n  left: 100%;\n}\n.col-xs-push-11 {\n  left: 91.66666667%;\n}\n.col-xs-push-10 {\n  left: 83.33333333%;\n}\n.col-xs-push-9 {\n  left: 75%;\n}\n.col-xs-push-8 {\n  left: 66.66666667%;\n}\n.col-xs-push-7 {\n  left: 58.33333333%;\n}\n.col-xs-push-6 {\n  left: 50%;\n}\n.col-xs-push-5 {\n  left: 41.66666667%;\n}\n.col-xs-push-4 {\n  left: 33.33333333%;\n}\n.col-xs-push-3 {\n  left: 25%;\n}\n.col-xs-push-2 {\n  left: 16.66666667%;\n}\n.col-xs-push-1 {\n  left: 8.33333333%;\n}\n.col-xs-push-0 {\n  left: auto;\n}\n.col-xs-offset-12 {\n  margin-left: 100%;\n}\n.col-xs-offset-11 {\n  margin-left: 91.66666667%;\n}\n.col-xs-offset-10 {\n  margin-left: 83.33333333%;\n}\n.col-xs-offset-9 {\n  margin-left: 75%;\n}\n.col-xs-offset-8 {\n  margin-left: 66.66666667%;\n}\n.col-xs-offset-7 {\n  margin-left: 58.33333333%;\n}\n.col-xs-offset-6 {\n  margin-left: 50%;\n}\n.col-xs-offset-5 {\n  margin-left: 41.66666667%;\n}\n.col-xs-offset-4 {\n  margin-left: 33.33333333%;\n}\n.col-xs-offset-3 {\n  margin-left: 25%;\n}\n.col-xs-offset-2 {\n  margin-left: 16.66666667%;\n}\n.col-xs-offset-1 {\n  margin-left: 8.33333333%;\n}\n.col-xs-offset-0 {\n  margin-left: 0%;\n}\n@media (min-width: 768px) {\n  .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {\n    float: left;\n  }\n  .col-sm-12 {\n    width: 100%;\n  }\n  .col-sm-11 {\n    width: 91.66666667%;\n  }\n  .col-sm-10 {\n    width: 83.33333333%;\n  }\n  .col-sm-9 {\n    width: 75%;\n  }\n  .col-sm-8 {\n    width: 66.66666667%;\n  }\n  .col-sm-7 {\n    width: 58.33333333%;\n  }\n  .col-sm-6 {\n    width: 50%;\n  }\n  .col-sm-5 {\n    width: 41.66666667%;\n  }\n  .col-sm-4 {\n    width: 33.33333333%;\n  }\n  .col-sm-3 {\n    width: 25%;\n  }\n  .col-sm-2 {\n    width: 16.66666667%;\n  }\n  .col-sm-1 {\n    width: 8.33333333%;\n  }\n  .col-sm-pull-12 {\n    right: 100%;\n  }\n  .col-sm-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-sm-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-sm-pull-9 {\n    right: 75%;\n  }\n  .col-sm-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-sm-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-sm-pull-6 {\n    right: 50%;\n  }\n  .col-sm-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-sm-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-sm-pull-3 {\n    right: 25%;\n  }\n  .col-sm-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-sm-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-sm-pull-0 {\n    right: auto;\n  }\n  .col-sm-push-12 {\n    left: 100%;\n  }\n  .col-sm-push-11 {\n    left: 91.66666667%;\n  }\n  .col-sm-push-10 {\n    left: 83.33333333%;\n  }\n  .col-sm-push-9 {\n    left: 75%;\n  }\n  .col-sm-push-8 {\n    left: 66.66666667%;\n  }\n  .col-sm-push-7 {\n    left: 58.33333333%;\n  }\n  .col-sm-push-6 {\n    left: 50%;\n  }\n  .col-sm-push-5 {\n    left: 41.66666667%;\n  }\n  .col-sm-push-4 {\n    left: 33.33333333%;\n  }\n  .col-sm-push-3 {\n    left: 25%;\n  }\n  .col-sm-push-2 {\n    left: 16.66666667%;\n  }\n  .col-sm-push-1 {\n    left: 8.33333333%;\n  }\n  .col-sm-push-0 {\n    left: auto;\n  }\n  .col-sm-offset-12 {\n    margin-left: 100%;\n  }\n  .col-sm-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-sm-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-sm-offset-9 {\n    margin-left: 75%;\n  }\n  .col-sm-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-sm-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-sm-offset-6 {\n    margin-left: 50%;\n  }\n  .col-sm-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-sm-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-sm-offset-3 {\n    margin-left: 25%;\n  }\n  .col-sm-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-sm-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-sm-offset-0 {\n    margin-left: 0%;\n  }\n}\n@media (min-width: 992px) {\n  .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {\n    float: left;\n  }\n  .col-md-12 {\n    width: 100%;\n  }\n  .col-md-11 {\n    width: 91.66666667%;\n  }\n  .col-md-10 {\n    width: 83.33333333%;\n  }\n  .col-md-9 {\n    width: 75%;\n  }\n  .col-md-8 {\n    width: 66.66666667%;\n  }\n  .col-md-7 {\n    width: 58.33333333%;\n  }\n  .col-md-6 {\n    width: 50%;\n  }\n  .col-md-5 {\n    width: 41.66666667%;\n  }\n  .col-md-4 {\n    width: 33.33333333%;\n  }\n  .col-md-3 {\n    width: 25%;\n  }\n  .col-md-2 {\n    width: 16.66666667%;\n  }\n  .col-md-1 {\n    width: 8.33333333%;\n  }\n  .col-md-pull-12 {\n    right: 100%;\n  }\n  .col-md-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-md-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-md-pull-9 {\n    right: 75%;\n  }\n  .col-md-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-md-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-md-pull-6 {\n    right: 50%;\n  }\n  .col-md-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-md-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-md-pull-3 {\n    right: 25%;\n  }\n  .col-md-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-md-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-md-pull-0 {\n    right: auto;\n  }\n  .col-md-push-12 {\n    left: 100%;\n  }\n  .col-md-push-11 {\n    left: 91.66666667%;\n  }\n  .col-md-push-10 {\n    left: 83.33333333%;\n  }\n  .col-md-push-9 {\n    left: 75%;\n  }\n  .col-md-push-8 {\n    left: 66.66666667%;\n  }\n  .col-md-push-7 {\n    left: 58.33333333%;\n  }\n  .col-md-push-6 {\n    left: 50%;\n  }\n  .col-md-push-5 {\n    left: 41.66666667%;\n  }\n  .col-md-push-4 {\n    left: 33.33333333%;\n  }\n  .col-md-push-3 {\n    left: 25%;\n  }\n  .col-md-push-2 {\n    left: 16.66666667%;\n  }\n  .col-md-push-1 {\n    left: 8.33333333%;\n  }\n  .col-md-push-0 {\n    left: auto;\n  }\n  .col-md-offset-12 {\n    margin-left: 100%;\n  }\n  .col-md-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-md-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-md-offset-9 {\n    margin-left: 75%;\n  }\n  .col-md-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-md-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-md-offset-6 {\n    margin-left: 50%;\n  }\n  .col-md-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-md-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-md-offset-3 {\n    margin-left: 25%;\n  }\n  .col-md-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-md-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-md-offset-0 {\n    margin-left: 0%;\n  }\n}\n@media (min-width: 1200px) {\n  .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {\n    float: left;\n  }\n  .col-lg-12 {\n    width: 100%;\n  }\n  .col-lg-11 {\n    width: 91.66666667%;\n  }\n  .col-lg-10 {\n    width: 83.33333333%;\n  }\n  .col-lg-9 {\n    width: 75%;\n  }\n  .col-lg-8 {\n    width: 66.66666667%;\n  }\n  .col-lg-7 {\n    width: 58.33333333%;\n  }\n  .col-lg-6 {\n    width: 50%;\n  }\n  .col-lg-5 {\n    width: 41.66666667%;\n  }\n  .col-lg-4 {\n    width: 33.33333333%;\n  }\n  .col-lg-3 {\n    width: 25%;\n  }\n  .col-lg-2 {\n    width: 16.66666667%;\n  }\n  .col-lg-1 {\n    width: 8.33333333%;\n  }\n  .col-lg-pull-12 {\n    right: 100%;\n  }\n  .col-lg-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-lg-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-lg-pull-9 {\n    right: 75%;\n  }\n  .col-lg-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-lg-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-lg-pull-6 {\n    right: 50%;\n  }\n  .col-lg-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-lg-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-lg-pull-3 {\n    right: 25%;\n  }\n  .col-lg-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-lg-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-lg-pull-0 {\n    right: auto;\n  }\n  .col-lg-push-12 {\n    left: 100%;\n  }\n  .col-lg-push-11 {\n    left: 91.66666667%;\n  }\n  .col-lg-push-10 {\n    left: 83.33333333%;\n  }\n  .col-lg-push-9 {\n    left: 75%;\n  }\n  .col-lg-push-8 {\n    left: 66.66666667%;\n  }\n  .col-lg-push-7 {\n    left: 58.33333333%;\n  }\n  .col-lg-push-6 {\n    left: 50%;\n  }\n  .col-lg-push-5 {\n    left: 41.66666667%;\n  }\n  .col-lg-push-4 {\n    left: 33.33333333%;\n  }\n  .col-lg-push-3 {\n    left: 25%;\n  }\n  .col-lg-push-2 {\n    left: 16.66666667%;\n  }\n  .col-lg-push-1 {\n    left: 8.33333333%;\n  }\n  .col-lg-push-0 {\n    left: auto;\n  }\n  .col-lg-offset-12 {\n    margin-left: 100%;\n  }\n  .col-lg-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-lg-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-lg-offset-9 {\n    margin-left: 75%;\n  }\n  .col-lg-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-lg-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-lg-offset-6 {\n    margin-left: 50%;\n  }\n  .col-lg-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-lg-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-lg-offset-3 {\n    margin-left: 25%;\n  }\n  .col-lg-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-lg-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-lg-offset-0 {\n    margin-left: 0%;\n  }\n}\ntable {\n  background-color: transparent;\n}\ncaption {\n  padding-top: 8px;\n  padding-bottom: 8px;\n  color: #b4bcc2;\n  text-align: left;\n}\nth {\n  text-align: left;\n}\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 21px;\n}\n.table > thead > tr > th,\n.table > tbody > tr > th,\n.table > tfoot > tr > th,\n.table > thead > tr > td,\n.table > tbody > tr > td,\n.table > tfoot > tr > td {\n  padding: 8px;\n  line-height: 1.42857143;\n  vertical-align: top;\n  border-top: 1px solid #ecf0f1;\n}\n.table > thead > tr > th {\n  vertical-align: bottom;\n  border-bottom: 2px solid #ecf0f1;\n}\n.table > caption + thead > tr:first-child > th,\n.table > colgroup + thead > tr:first-child > th,\n.table > thead:first-child > tr:first-child > th,\n.table > caption + thead > tr:first-child > td,\n.table > colgroup + thead > tr:first-child > td,\n.table > thead:first-child > tr:first-child > td {\n  border-top: 0;\n}\n.table > tbody + tbody {\n  border-top: 2px solid #ecf0f1;\n}\n.table .table {\n  background-color: #ffffff;\n}\n.table-condensed > thead > tr > th,\n.table-condensed > tbody > tr > th,\n.table-condensed > tfoot > tr > th,\n.table-condensed > thead > tr > td,\n.table-condensed > tbody > tr > td,\n.table-condensed > tfoot > tr > td {\n  padding: 5px;\n}\n.table-bordered {\n  border: 1px solid #ecf0f1;\n}\n.table-bordered > thead > tr > th,\n.table-bordered > tbody > tr > th,\n.table-bordered > tfoot > tr > th,\n.table-bordered > thead > tr > td,\n.table-bordered > tbody > tr > td,\n.table-bordered > tfoot > tr > td {\n  border: 1px solid #ecf0f1;\n}\n.table-bordered > thead > tr > th,\n.table-bordered > thead > tr > td {\n  border-bottom-width: 2px;\n}\n.table-striped > tbody > tr:nth-of-type(odd) {\n  background-color: #f9f9f9;\n}\n.table-hover > tbody > tr:hover {\n  background-color: #ecf0f1;\n}\ntable col[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-column;\n}\ntable td[class*=\"col-\"],\ntable th[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-cell;\n}\n.table > thead > tr > td.active,\n.table > tbody > tr > td.active,\n.table > tfoot > tr > td.active,\n.table > thead > tr > th.active,\n.table > tbody > tr > th.active,\n.table > tfoot > tr > th.active,\n.table > thead > tr.active > td,\n.table > tbody > tr.active > td,\n.table > tfoot > tr.active > td,\n.table > thead > tr.active > th,\n.table > tbody > tr.active > th,\n.table > tfoot > tr.active > th {\n  background-color: #ecf0f1;\n}\n.table-hover > tbody > tr > td.active:hover,\n.table-hover > tbody > tr > th.active:hover,\n.table-hover > tbody > tr.active:hover > td,\n.table-hover > tbody > tr:hover > .active,\n.table-hover > tbody > tr.active:hover > th {\n  background-color: #dde4e6;\n}\n.table > thead > tr > td.success,\n.table > tbody > tr > td.success,\n.table > tfoot > tr > td.success,\n.table > thead > tr > th.success,\n.table > tbody > tr > th.success,\n.table > tfoot > tr > th.success,\n.table > thead > tr.success > td,\n.table > tbody > tr.success > td,\n.table > tfoot > tr.success > td,\n.table > thead > tr.success > th,\n.table > tbody > tr.success > th,\n.table > tfoot > tr.success > th {\n  background-color: #18bc9c;\n}\n.table-hover > tbody > tr > td.success:hover,\n.table-hover > tbody > tr > th.success:hover,\n.table-hover > tbody > tr.success:hover > td,\n.table-hover > tbody > tr:hover > .success,\n.table-hover > tbody > tr.success:hover > th {\n  background-color: #15a589;\n}\n.table > thead > tr > td.info,\n.table > tbody > tr > td.info,\n.table > tfoot > tr > td.info,\n.table > thead > tr > th.info,\n.table > tbody > tr > th.info,\n.table > tfoot > tr > th.info,\n.table > thead > tr.info > td,\n.table > tbody > tr.info > td,\n.table > tfoot > tr.info > td,\n.table > thead > tr.info > th,\n.table > tbody > tr.info > th,\n.table > tfoot > tr.info > th {\n  background-color: #3498db;\n}\n.table-hover > tbody > tr > td.info:hover,\n.table-hover > tbody > tr > th.info:hover,\n.table-hover > tbody > tr.info:hover > td,\n.table-hover > tbody > tr:hover > .info,\n.table-hover > tbody > tr.info:hover > th {\n  background-color: #258cd1;\n}\n.table > thead > tr > td.warning,\n.table > tbody > tr > td.warning,\n.table > tfoot > tr > td.warning,\n.table > thead > tr > th.warning,\n.table > tbody > tr > th.warning,\n.table > tfoot > tr > th.warning,\n.table > thead > tr.warning > td,\n.table > tbody > tr.warning > td,\n.table > tfoot > tr.warning > td,\n.table > thead > tr.warning > th,\n.table > tbody > tr.warning > th,\n.table > tfoot > tr.warning > th {\n  background-color: #f39c12;\n}\n.table-hover > tbody > tr > td.warning:hover,\n.table-hover > tbody > tr > th.warning:hover,\n.table-hover > tbody > tr.warning:hover > td,\n.table-hover > tbody > tr:hover > .warning,\n.table-hover > tbody > tr.warning:hover > th {\n  background-color: #e08e0b;\n}\n.table > thead > tr > td.danger,\n.table > tbody > tr > td.danger,\n.table > tfoot > tr > td.danger,\n.table > thead > tr > th.danger,\n.table > tbody > tr > th.danger,\n.table > tfoot > tr > th.danger,\n.table > thead > tr.danger > td,\n.table > tbody > tr.danger > td,\n.table > tfoot > tr.danger > td,\n.table > thead > tr.danger > th,\n.table > tbody > tr.danger > th,\n.table > tfoot > tr.danger > th {\n  background-color: #e74c3c;\n}\n.table-hover > tbody > tr > td.danger:hover,\n.table-hover > tbody > tr > th.danger:hover,\n.table-hover > tbody > tr.danger:hover > td,\n.table-hover > tbody > tr:hover > .danger,\n.table-hover > tbody > tr.danger:hover > th {\n  background-color: #e43725;\n}\n.table-responsive {\n  overflow-x: auto;\n  min-height: 0.01%;\n}\n@media screen and (max-width: 767px) {\n  .table-responsive {\n    width: 100%;\n    margin-bottom: 15.75px;\n    overflow-y: hidden;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n    border: 1px solid #ecf0f1;\n  }\n  .table-responsive > .table {\n    margin-bottom: 0;\n  }\n  .table-responsive > .table > thead > tr > th,\n  .table-responsive > .table > tbody > tr > th,\n  .table-responsive > .table > tfoot > tr > th,\n  .table-responsive > .table > thead > tr > td,\n  .table-responsive > .table > tbody > tr > td,\n  .table-responsive > .table > tfoot > tr > td {\n    white-space: nowrap;\n  }\n  .table-responsive > .table-bordered {\n    border: 0;\n  }\n  .table-responsive > .table-bordered > thead > tr > th:first-child,\n  .table-responsive > .table-bordered > tbody > tr > th:first-child,\n  .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n  .table-responsive > .table-bordered > thead > tr > td:first-child,\n  .table-responsive > .table-bordered > tbody > tr > td:first-child,\n  .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n    border-left: 0;\n  }\n  .table-responsive > .table-bordered > thead > tr > th:last-child,\n  .table-responsive > .table-bordered > tbody > tr > th:last-child,\n  .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n  .table-responsive > .table-bordered > thead > tr > td:last-child,\n  .table-responsive > .table-bordered > tbody > tr > td:last-child,\n  .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n    border-right: 0;\n  }\n  .table-responsive > .table-bordered > tbody > tr:last-child > th,\n  .table-responsive > .table-bordered > tfoot > tr:last-child > th,\n  .table-responsive > .table-bordered > tbody > tr:last-child > td,\n  .table-responsive > .table-bordered > tfoot > tr:last-child > td {\n    border-bottom: 0;\n  }\n}\nfieldset {\n  padding: 0;\n  margin: 0;\n  border: 0;\n  min-width: 0;\n}\nlegend {\n  display: block;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 21px;\n  font-size: 22.5px;\n  line-height: inherit;\n  color: #2c3e50;\n  border: 0;\n  border-bottom: 1px solid transparent;\n}\nlabel {\n  display: inline-block;\n  max-width: 100%;\n  margin-bottom: 5px;\n  font-weight: bold;\n}\ninput[type=\"search\"] {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  margin: 4px 0 0;\n  margin-top: 1px \\9;\n  line-height: normal;\n}\ninput[type=\"file\"] {\n  display: block;\n}\ninput[type=\"range\"] {\n  display: block;\n  width: 100%;\n}\nselect[multiple],\nselect[size] {\n  height: auto;\n}\ninput[type=\"file\"]:focus,\ninput[type=\"radio\"]:focus,\ninput[type=\"checkbox\"]:focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\noutput {\n  display: block;\n  padding-top: 11px;\n  font-size: 15px;\n  line-height: 1.42857143;\n  color: #2c3e50;\n}\n.form-control {\n  display: block;\n  width: 100%;\n  height: 45px;\n  padding: 10px 15px;\n  font-size: 15px;\n  line-height: 1.42857143;\n  color: #2c3e50;\n  background-color: #ffffff;\n  background-image: none;\n  border: 1px solid #dce4ec;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;\n  -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n}\n.form-control:focus {\n  border-color: #2c3e50;\n  outline: 0;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(44, 62, 80, 0.6);\n  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(44, 62, 80, 0.6);\n}\n.form-control::-moz-placeholder {\n  color: #acb6c0;\n  opacity: 1;\n}\n.form-control:-ms-input-placeholder {\n  color: #acb6c0;\n}\n.form-control::-webkit-input-placeholder {\n  color: #acb6c0;\n}\n.form-control::-ms-expand {\n  border: 0;\n  background-color: transparent;\n}\n.form-control[disabled],\n.form-control[readonly],\nfieldset[disabled] .form-control {\n  background-color: #ecf0f1;\n  opacity: 1;\n}\n.form-control[disabled],\nfieldset[disabled] .form-control {\n  cursor: not-allowed;\n}\ntextarea.form-control {\n  height: auto;\n}\ninput[type=\"search\"] {\n  -webkit-appearance: none;\n}\n@media screen and (-webkit-min-device-pixel-ratio: 0) {\n  input[type=\"date\"].form-control,\n  input[type=\"time\"].form-control,\n  input[type=\"datetime-local\"].form-control,\n  input[type=\"month\"].form-control {\n    line-height: 45px;\n  }\n  input[type=\"date\"].input-sm,\n  input[type=\"time\"].input-sm,\n  input[type=\"datetime-local\"].input-sm,\n  input[type=\"month\"].input-sm,\n  .input-group-sm input[type=\"date\"],\n  .input-group-sm input[type=\"time\"],\n  .input-group-sm input[type=\"datetime-local\"],\n  .input-group-sm input[type=\"month\"] {\n    line-height: 35px;\n  }\n  input[type=\"date\"].input-lg,\n  input[type=\"time\"].input-lg,\n  input[type=\"datetime-local\"].input-lg,\n  input[type=\"month\"].input-lg,\n  .input-group-lg input[type=\"date\"],\n  .input-group-lg input[type=\"time\"],\n  .input-group-lg input[type=\"datetime-local\"],\n  .input-group-lg input[type=\"month\"] {\n    line-height: 66px;\n  }\n}\n.form-group {\n  margin-bottom: 15px;\n}\n.radio,\n.checkbox {\n  position: relative;\n  display: block;\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.radio label,\n.checkbox label {\n  min-height: 21px;\n  padding-left: 20px;\n  margin-bottom: 0;\n  font-weight: normal;\n  cursor: pointer;\n}\n.radio input[type=\"radio\"],\n.radio-inline input[type=\"radio\"],\n.checkbox input[type=\"checkbox\"],\n.checkbox-inline input[type=\"checkbox\"] {\n  position: absolute;\n  margin-left: -20px;\n  margin-top: 4px \\9;\n}\n.radio + .radio,\n.checkbox + .checkbox {\n  margin-top: -5px;\n}\n.radio-inline,\n.checkbox-inline {\n  position: relative;\n  display: inline-block;\n  padding-left: 20px;\n  margin-bottom: 0;\n  vertical-align: middle;\n  font-weight: normal;\n  cursor: pointer;\n}\n.radio-inline + .radio-inline,\n.checkbox-inline + .checkbox-inline {\n  margin-top: 0;\n  margin-left: 10px;\n}\ninput[type=\"radio\"][disabled],\ninput[type=\"checkbox\"][disabled],\ninput[type=\"radio\"].disabled,\ninput[type=\"checkbox\"].disabled,\nfieldset[disabled] input[type=\"radio\"],\nfieldset[disabled] input[type=\"checkbox\"] {\n  cursor: not-allowed;\n}\n.radio-inline.disabled,\n.checkbox-inline.disabled,\nfieldset[disabled] .radio-inline,\nfieldset[disabled] .checkbox-inline {\n  cursor: not-allowed;\n}\n.radio.disabled label,\n.checkbox.disabled label,\nfieldset[disabled] .radio label,\nfieldset[disabled] .checkbox label {\n  cursor: not-allowed;\n}\n.form-control-static {\n  padding-top: 11px;\n  padding-bottom: 11px;\n  margin-bottom: 0;\n  min-height: 36px;\n}\n.form-control-static.input-lg,\n.form-control-static.input-sm {\n  padding-left: 0;\n  padding-right: 0;\n}\n.input-sm {\n  height: 35px;\n  padding: 6px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\nselect.input-sm {\n  height: 35px;\n  line-height: 35px;\n}\ntextarea.input-sm,\nselect[multiple].input-sm {\n  height: auto;\n}\n.form-group-sm .form-control {\n  height: 35px;\n  padding: 6px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.form-group-sm select.form-control {\n  height: 35px;\n  line-height: 35px;\n}\n.form-group-sm textarea.form-control,\n.form-group-sm select[multiple].form-control {\n  height: auto;\n}\n.form-group-sm .form-control-static {\n  height: 35px;\n  min-height: 34px;\n  padding: 7px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n}\n.input-lg {\n  height: 66px;\n  padding: 18px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\nselect.input-lg {\n  height: 66px;\n  line-height: 66px;\n}\ntextarea.input-lg,\nselect[multiple].input-lg {\n  height: auto;\n}\n.form-group-lg .form-control {\n  height: 66px;\n  padding: 18px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.form-group-lg select.form-control {\n  height: 66px;\n  line-height: 66px;\n}\n.form-group-lg textarea.form-control,\n.form-group-lg select[multiple].form-control {\n  height: auto;\n}\n.form-group-lg .form-control-static {\n  height: 66px;\n  min-height: 40px;\n  padding: 19px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n}\n.has-feedback {\n  position: relative;\n}\n.has-feedback .form-control {\n  padding-right: 56.25px;\n}\n.form-control-feedback {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  display: block;\n  width: 45px;\n  height: 45px;\n  line-height: 45px;\n  text-align: center;\n  pointer-events: none;\n}\n.input-lg + .form-control-feedback,\n.input-group-lg + .form-control-feedback,\n.form-group-lg .form-control + .form-control-feedback {\n  width: 66px;\n  height: 66px;\n  line-height: 66px;\n}\n.input-sm + .form-control-feedback,\n.input-group-sm + .form-control-feedback,\n.form-group-sm .form-control + .form-control-feedback {\n  width: 35px;\n  height: 35px;\n  line-height: 35px;\n}\n.has-success .help-block,\n.has-success .control-label,\n.has-success .radio,\n.has-success .checkbox,\n.has-success .radio-inline,\n.has-success .checkbox-inline,\n.has-success.radio label,\n.has-success.checkbox label,\n.has-success.radio-inline label,\n.has-success.checkbox-inline label {\n  color: #ffffff;\n}\n.has-success .form-control {\n  border-color: #ffffff;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.has-success .form-control:focus {\n  border-color: #e6e6e6;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n}\n.has-success .input-group-addon {\n  color: #ffffff;\n  border-color: #ffffff;\n  background-color: #18bc9c;\n}\n.has-success .form-control-feedback {\n  color: #ffffff;\n}\n.has-warning .help-block,\n.has-warning .control-label,\n.has-warning .radio,\n.has-warning .checkbox,\n.has-warning .radio-inline,\n.has-warning .checkbox-inline,\n.has-warning.radio label,\n.has-warning.checkbox label,\n.has-warning.radio-inline label,\n.has-warning.checkbox-inline label {\n  color: #ffffff;\n}\n.has-warning .form-control {\n  border-color: #ffffff;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.has-warning .form-control:focus {\n  border-color: #e6e6e6;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n}\n.has-warning .input-group-addon {\n  color: #ffffff;\n  border-color: #ffffff;\n  background-color: #f39c12;\n}\n.has-warning .form-control-feedback {\n  color: #ffffff;\n}\n.has-error .help-block,\n.has-error .control-label,\n.has-error .radio,\n.has-error .checkbox,\n.has-error .radio-inline,\n.has-error .checkbox-inline,\n.has-error.radio label,\n.has-error.checkbox label,\n.has-error.radio-inline label,\n.has-error.checkbox-inline label {\n  color: #ffffff;\n}\n.has-error .form-control {\n  border-color: #ffffff;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.has-error .form-control:focus {\n  border-color: #e6e6e6;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ffffff;\n}\n.has-error .input-group-addon {\n  color: #ffffff;\n  border-color: #ffffff;\n  background-color: #e74c3c;\n}\n.has-error .form-control-feedback {\n  color: #ffffff;\n}\n.has-feedback label ~ .form-control-feedback {\n  top: 26px;\n}\n.has-feedback label.sr-only ~ .form-control-feedback {\n  top: 0;\n}\n.help-block {\n  display: block;\n  margin-top: 5px;\n  margin-bottom: 10px;\n  color: #597ea2;\n}\n@media (min-width: 768px) {\n  .form-inline .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .form-inline .form-control-static {\n    display: inline-block;\n  }\n  .form-inline .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .form-inline .input-group .input-group-addon,\n  .form-inline .input-group .input-group-btn,\n  .form-inline .input-group .form-control {\n    width: auto;\n  }\n  .form-inline .input-group > .form-control {\n    width: 100%;\n  }\n  .form-inline .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .radio,\n  .form-inline .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .radio label,\n  .form-inline .checkbox label {\n    padding-left: 0;\n  }\n  .form-inline .radio input[type=\"radio\"],\n  .form-inline .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .form-inline .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n.form-horizontal .radio,\n.form-horizontal .checkbox,\n.form-horizontal .radio-inline,\n.form-horizontal .checkbox-inline {\n  margin-top: 0;\n  margin-bottom: 0;\n  padding-top: 11px;\n}\n.form-horizontal .radio,\n.form-horizontal .checkbox {\n  min-height: 32px;\n}\n.form-horizontal .form-group {\n  margin-left: -15px;\n  margin-right: -15px;\n}\n@media (min-width: 768px) {\n  .form-horizontal .control-label {\n    text-align: right;\n    margin-bottom: 0;\n    padding-top: 11px;\n  }\n}\n.form-horizontal .has-feedback .form-control-feedback {\n  right: 15px;\n}\n@media (min-width: 768px) {\n  .form-horizontal .form-group-lg .control-label {\n    padding-top: 19px;\n    font-size: 19px;\n  }\n}\n@media (min-width: 768px) {\n  .form-horizontal .form-group-sm .control-label {\n    padding-top: 7px;\n    font-size: 13px;\n  }\n}\n.btn {\n  display: inline-block;\n  margin-bottom: 0;\n  font-weight: normal;\n  text-align: center;\n  vertical-align: middle;\n  -ms-touch-action: manipulation;\n      touch-action: manipulation;\n  cursor: pointer;\n  background-image: none;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  padding: 10px 15px;\n  font-size: 15px;\n  line-height: 1.42857143;\n  border-radius: 4px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.btn:focus,\n.btn:active:focus,\n.btn.active:focus,\n.btn.focus,\n.btn:active.focus,\n.btn.active.focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.btn:hover,\n.btn:focus,\n.btn.focus {\n  color: #ffffff;\n  text-decoration: none;\n}\n.btn:active,\n.btn.active {\n  outline: 0;\n  background-image: none;\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.btn.disabled,\n.btn[disabled],\nfieldset[disabled] .btn {\n  cursor: not-allowed;\n  opacity: 0.65;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\na.btn.disabled,\nfieldset[disabled] a.btn {\n  pointer-events: none;\n}\n.btn-default {\n  color: #ffffff;\n  background-color: #95a5a6;\n  border-color: #95a5a6;\n}\n.btn-default:focus,\n.btn-default.focus {\n  color: #ffffff;\n  background-color: #798d8f;\n  border-color: #566566;\n}\n.btn-default:hover {\n  color: #ffffff;\n  background-color: #798d8f;\n  border-color: #74898a;\n}\n.btn-default:active,\n.btn-default.active,\n.open > .dropdown-toggle.btn-default {\n  color: #ffffff;\n  background-color: #798d8f;\n  border-color: #74898a;\n}\n.btn-default:active:hover,\n.btn-default.active:hover,\n.open > .dropdown-toggle.btn-default:hover,\n.btn-default:active:focus,\n.btn-default.active:focus,\n.open > .dropdown-toggle.btn-default:focus,\n.btn-default:active.focus,\n.btn-default.active.focus,\n.open > .dropdown-toggle.btn-default.focus {\n  color: #ffffff;\n  background-color: #687b7c;\n  border-color: #566566;\n}\n.btn-default:active,\n.btn-default.active,\n.open > .dropdown-toggle.btn-default {\n  background-image: none;\n}\n.btn-default.disabled:hover,\n.btn-default[disabled]:hover,\nfieldset[disabled] .btn-default:hover,\n.btn-default.disabled:focus,\n.btn-default[disabled]:focus,\nfieldset[disabled] .btn-default:focus,\n.btn-default.disabled.focus,\n.btn-default[disabled].focus,\nfieldset[disabled] .btn-default.focus {\n  background-color: #95a5a6;\n  border-color: #95a5a6;\n}\n.btn-default .badge {\n  color: #95a5a6;\n  background-color: #ffffff;\n}\n.btn-primary {\n  color: #ffffff;\n  background-color: #2c3e50;\n  border-color: #2c3e50;\n}\n.btn-primary:focus,\n.btn-primary.focus {\n  color: #ffffff;\n  background-color: #1a242f;\n  border-color: #000000;\n}\n.btn-primary:hover {\n  color: #ffffff;\n  background-color: #1a242f;\n  border-color: #161f29;\n}\n.btn-primary:active,\n.btn-primary.active,\n.open > .dropdown-toggle.btn-primary {\n  color: #ffffff;\n  background-color: #1a242f;\n  border-color: #161f29;\n}\n.btn-primary:active:hover,\n.btn-primary.active:hover,\n.open > .dropdown-toggle.btn-primary:hover,\n.btn-primary:active:focus,\n.btn-primary.active:focus,\n.open > .dropdown-toggle.btn-primary:focus,\n.btn-primary:active.focus,\n.btn-primary.active.focus,\n.open > .dropdown-toggle.btn-primary.focus {\n  color: #ffffff;\n  background-color: #0d1318;\n  border-color: #000000;\n}\n.btn-primary:active,\n.btn-primary.active,\n.open > .dropdown-toggle.btn-primary {\n  background-image: none;\n}\n.btn-primary.disabled:hover,\n.btn-primary[disabled]:hover,\nfieldset[disabled] .btn-primary:hover,\n.btn-primary.disabled:focus,\n.btn-primary[disabled]:focus,\nfieldset[disabled] .btn-primary:focus,\n.btn-primary.disabled.focus,\n.btn-primary[disabled].focus,\nfieldset[disabled] .btn-primary.focus {\n  background-color: #2c3e50;\n  border-color: #2c3e50;\n}\n.btn-primary .badge {\n  color: #2c3e50;\n  background-color: #ffffff;\n}\n.btn-success {\n  color: #ffffff;\n  background-color: #18bc9c;\n  border-color: #18bc9c;\n}\n.btn-success:focus,\n.btn-success.focus {\n  color: #ffffff;\n  background-color: #128f76;\n  border-color: #0a4b3e;\n}\n.btn-success:hover {\n  color: #ffffff;\n  background-color: #128f76;\n  border-color: #11866f;\n}\n.btn-success:active,\n.btn-success.active,\n.open > .dropdown-toggle.btn-success {\n  color: #ffffff;\n  background-color: #128f76;\n  border-color: #11866f;\n}\n.btn-success:active:hover,\n.btn-success.active:hover,\n.open > .dropdown-toggle.btn-success:hover,\n.btn-success:active:focus,\n.btn-success.active:focus,\n.open > .dropdown-toggle.btn-success:focus,\n.btn-success:active.focus,\n.btn-success.active.focus,\n.open > .dropdown-toggle.btn-success.focus {\n  color: #ffffff;\n  background-color: #0e6f5c;\n  border-color: #0a4b3e;\n}\n.btn-success:active,\n.btn-success.active,\n.open > .dropdown-toggle.btn-success {\n  background-image: none;\n}\n.btn-success.disabled:hover,\n.btn-success[disabled]:hover,\nfieldset[disabled] .btn-success:hover,\n.btn-success.disabled:focus,\n.btn-success[disabled]:focus,\nfieldset[disabled] .btn-success:focus,\n.btn-success.disabled.focus,\n.btn-success[disabled].focus,\nfieldset[disabled] .btn-success.focus {\n  background-color: #18bc9c;\n  border-color: #18bc9c;\n}\n.btn-success .badge {\n  color: #18bc9c;\n  background-color: #ffffff;\n}\n.btn-info {\n  color: #ffffff;\n  background-color: #3498db;\n  border-color: #3498db;\n}\n.btn-info:focus,\n.btn-info.focus {\n  color: #ffffff;\n  background-color: #217dbb;\n  border-color: #16527a;\n}\n.btn-info:hover {\n  color: #ffffff;\n  background-color: #217dbb;\n  border-color: #2077b2;\n}\n.btn-info:active,\n.btn-info.active,\n.open > .dropdown-toggle.btn-info {\n  color: #ffffff;\n  background-color: #217dbb;\n  border-color: #2077b2;\n}\n.btn-info:active:hover,\n.btn-info.active:hover,\n.open > .dropdown-toggle.btn-info:hover,\n.btn-info:active:focus,\n.btn-info.active:focus,\n.open > .dropdown-toggle.btn-info:focus,\n.btn-info:active.focus,\n.btn-info.active.focus,\n.open > .dropdown-toggle.btn-info.focus {\n  color: #ffffff;\n  background-color: #1c699d;\n  border-color: #16527a;\n}\n.btn-info:active,\n.btn-info.active,\n.open > .dropdown-toggle.btn-info {\n  background-image: none;\n}\n.btn-info.disabled:hover,\n.btn-info[disabled]:hover,\nfieldset[disabled] .btn-info:hover,\n.btn-info.disabled:focus,\n.btn-info[disabled]:focus,\nfieldset[disabled] .btn-info:focus,\n.btn-info.disabled.focus,\n.btn-info[disabled].focus,\nfieldset[disabled] .btn-info.focus {\n  background-color: #3498db;\n  border-color: #3498db;\n}\n.btn-info .badge {\n  color: #3498db;\n  background-color: #ffffff;\n}\n.btn-warning {\n  color: #ffffff;\n  background-color: #f39c12;\n  border-color: #f39c12;\n}\n.btn-warning:focus,\n.btn-warning.focus {\n  color: #ffffff;\n  background-color: #c87f0a;\n  border-color: #7f5006;\n}\n.btn-warning:hover {\n  color: #ffffff;\n  background-color: #c87f0a;\n  border-color: #be780a;\n}\n.btn-warning:active,\n.btn-warning.active,\n.open > .dropdown-toggle.btn-warning {\n  color: #ffffff;\n  background-color: #c87f0a;\n  border-color: #be780a;\n}\n.btn-warning:active:hover,\n.btn-warning.active:hover,\n.open > .dropdown-toggle.btn-warning:hover,\n.btn-warning:active:focus,\n.btn-warning.active:focus,\n.open > .dropdown-toggle.btn-warning:focus,\n.btn-warning:active.focus,\n.btn-warning.active.focus,\n.open > .dropdown-toggle.btn-warning.focus {\n  color: #ffffff;\n  background-color: #a66908;\n  border-color: #7f5006;\n}\n.btn-warning:active,\n.btn-warning.active,\n.open > .dropdown-toggle.btn-warning {\n  background-image: none;\n}\n.btn-warning.disabled:hover,\n.btn-warning[disabled]:hover,\nfieldset[disabled] .btn-warning:hover,\n.btn-warning.disabled:focus,\n.btn-warning[disabled]:focus,\nfieldset[disabled] .btn-warning:focus,\n.btn-warning.disabled.focus,\n.btn-warning[disabled].focus,\nfieldset[disabled] .btn-warning.focus {\n  background-color: #f39c12;\n  border-color: #f39c12;\n}\n.btn-warning .badge {\n  color: #f39c12;\n  background-color: #ffffff;\n}\n.btn-danger {\n  color: #ffffff;\n  background-color: #e74c3c;\n  border-color: #e74c3c;\n}\n.btn-danger:focus,\n.btn-danger.focus {\n  color: #ffffff;\n  background-color: #d62c1a;\n  border-color: #921e12;\n}\n.btn-danger:hover {\n  color: #ffffff;\n  background-color: #d62c1a;\n  border-color: #cd2a19;\n}\n.btn-danger:active,\n.btn-danger.active,\n.open > .dropdown-toggle.btn-danger {\n  color: #ffffff;\n  background-color: #d62c1a;\n  border-color: #cd2a19;\n}\n.btn-danger:active:hover,\n.btn-danger.active:hover,\n.open > .dropdown-toggle.btn-danger:hover,\n.btn-danger:active:focus,\n.btn-danger.active:focus,\n.open > .dropdown-toggle.btn-danger:focus,\n.btn-danger:active.focus,\n.btn-danger.active.focus,\n.open > .dropdown-toggle.btn-danger.focus {\n  color: #ffffff;\n  background-color: #b62516;\n  border-color: #921e12;\n}\n.btn-danger:active,\n.btn-danger.active,\n.open > .dropdown-toggle.btn-danger {\n  background-image: none;\n}\n.btn-danger.disabled:hover,\n.btn-danger[disabled]:hover,\nfieldset[disabled] .btn-danger:hover,\n.btn-danger.disabled:focus,\n.btn-danger[disabled]:focus,\nfieldset[disabled] .btn-danger:focus,\n.btn-danger.disabled.focus,\n.btn-danger[disabled].focus,\nfieldset[disabled] .btn-danger.focus {\n  background-color: #e74c3c;\n  border-color: #e74c3c;\n}\n.btn-danger .badge {\n  color: #e74c3c;\n  background-color: #ffffff;\n}\n.btn-link {\n  color: #18bc9c;\n  font-weight: normal;\n  border-radius: 0;\n}\n.btn-link,\n.btn-link:active,\n.btn-link.active,\n.btn-link[disabled],\nfieldset[disabled] .btn-link {\n  background-color: transparent;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.btn-link,\n.btn-link:hover,\n.btn-link:focus,\n.btn-link:active {\n  border-color: transparent;\n}\n.btn-link:hover,\n.btn-link:focus {\n  color: #18bc9c;\n  text-decoration: underline;\n  background-color: transparent;\n}\n.btn-link[disabled]:hover,\nfieldset[disabled] .btn-link:hover,\n.btn-link[disabled]:focus,\nfieldset[disabled] .btn-link:focus {\n  color: #b4bcc2;\n  text-decoration: none;\n}\n.btn-lg,\n.btn-group-lg > .btn {\n  padding: 18px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.btn-sm,\n.btn-group-sm > .btn {\n  padding: 6px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.btn-xs,\n.btn-group-xs > .btn {\n  padding: 1px 5px;\n  font-size: 13px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.btn-block {\n  display: block;\n  width: 100%;\n}\n.btn-block + .btn-block {\n  margin-top: 5px;\n}\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%;\n}\n.fade {\n  opacity: 0;\n  -webkit-transition: opacity 0.15s linear;\n  -o-transition: opacity 0.15s linear;\n  transition: opacity 0.15s linear;\n}\n.fade.in {\n  opacity: 1;\n}\n.collapse {\n  display: none;\n}\n.collapse.in {\n  display: block;\n}\ntr.collapse.in {\n  display: table-row;\n}\ntbody.collapse.in {\n  display: table-row-group;\n}\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition-property: height, visibility;\n  -o-transition-property: height, visibility;\n     transition-property: height, visibility;\n  -webkit-transition-duration: 0.35s;\n  -o-transition-duration: 0.35s;\n     transition-duration: 0.35s;\n  -webkit-transition-timing-function: ease;\n  -o-transition-timing-function: ease;\n     transition-timing-function: ease;\n}\n.caret {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 2px;\n  vertical-align: middle;\n  border-top: 4px dashed;\n  border-top: 4px solid \\9;\n  border-right: 4px solid transparent;\n  border-left: 4px solid transparent;\n}\n.dropup,\n.dropdown {\n  position: relative;\n}\n.dropdown-toggle:focus {\n  outline: 0;\n}\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 2px 0 0;\n  list-style: none;\n  font-size: 15px;\n  text-align: left;\n  background-color: #ffffff;\n  border: 1px solid #cccccc;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n}\n.dropdown-menu.pull-right {\n  right: 0;\n  left: auto;\n}\n.dropdown-menu .divider {\n  height: 1px;\n  margin: 9.5px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.dropdown-menu > li > a {\n  display: block;\n  padding: 3px 20px;\n  clear: both;\n  font-weight: normal;\n  line-height: 1.42857143;\n  color: #7b8a8b;\n  white-space: nowrap;\n}\n.dropdown-menu > li > a:hover,\n.dropdown-menu > li > a:focus {\n  text-decoration: none;\n  color: #ffffff;\n  background-color: #2c3e50;\n}\n.dropdown-menu > .active > a,\n.dropdown-menu > .active > a:hover,\n.dropdown-menu > .active > a:focus {\n  color: #ffffff;\n  text-decoration: none;\n  outline: 0;\n  background-color: #2c3e50;\n}\n.dropdown-menu > .disabled > a,\n.dropdown-menu > .disabled > a:hover,\n.dropdown-menu > .disabled > a:focus {\n  color: #b4bcc2;\n}\n.dropdown-menu > .disabled > a:hover,\n.dropdown-menu > .disabled > a:focus {\n  text-decoration: none;\n  background-color: transparent;\n  background-image: none;\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);\n  cursor: not-allowed;\n}\n.open > .dropdown-menu {\n  display: block;\n}\n.open > a {\n  outline: 0;\n}\n.dropdown-menu-right {\n  left: auto;\n  right: 0;\n}\n.dropdown-menu-left {\n  left: 0;\n  right: auto;\n}\n.dropdown-header {\n  display: block;\n  padding: 3px 20px;\n  font-size: 13px;\n  line-height: 1.42857143;\n  color: #b4bcc2;\n  white-space: nowrap;\n}\n.dropdown-backdrop {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  z-index: 990;\n}\n.pull-right > .dropdown-menu {\n  right: 0;\n  left: auto;\n}\n.dropup .caret,\n.navbar-fixed-bottom .dropdown .caret {\n  border-top: 0;\n  border-bottom: 4px dashed;\n  border-bottom: 4px solid \\9;\n  content: \"\";\n}\n.dropup .dropdown-menu,\n.navbar-fixed-bottom .dropdown .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-bottom: 2px;\n}\n@media (min-width: 768px) {\n  .navbar-right .dropdown-menu {\n    left: auto;\n    right: 0;\n  }\n  .navbar-right .dropdown-menu-left {\n    left: 0;\n    right: auto;\n  }\n}\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n}\n.btn-group > .btn,\n.btn-group-vertical > .btn {\n  position: relative;\n  float: left;\n}\n.btn-group > .btn:hover,\n.btn-group-vertical > .btn:hover,\n.btn-group > .btn:focus,\n.btn-group-vertical > .btn:focus,\n.btn-group > .btn:active,\n.btn-group-vertical > .btn:active,\n.btn-group > .btn.active,\n.btn-group-vertical > .btn.active {\n  z-index: 2;\n}\n.btn-group .btn + .btn,\n.btn-group .btn + .btn-group,\n.btn-group .btn-group + .btn,\n.btn-group .btn-group + .btn-group {\n  margin-left: -1px;\n}\n.btn-toolbar {\n  margin-left: -5px;\n}\n.btn-toolbar .btn,\n.btn-toolbar .btn-group,\n.btn-toolbar .input-group {\n  float: left;\n}\n.btn-toolbar > .btn,\n.btn-toolbar > .btn-group,\n.btn-toolbar > .input-group {\n  margin-left: 5px;\n}\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n.btn-group > .btn:first-child {\n  margin-left: 0;\n}\n.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.btn-group > .btn:last-child:not(:first-child),\n.btn-group > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.btn-group > .btn-group {\n  float: left;\n}\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.btn-group .dropdown-toggle:active,\n.btn-group.open .dropdown-toggle {\n  outline: 0;\n}\n.btn-group > .btn + .dropdown-toggle {\n  padding-left: 8px;\n  padding-right: 8px;\n}\n.btn-group > .btn-lg + .dropdown-toggle {\n  padding-left: 12px;\n  padding-right: 12px;\n}\n.btn-group.open .dropdown-toggle {\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.btn-group.open .dropdown-toggle.btn-link {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.btn .caret {\n  margin-left: 0;\n}\n.btn-lg .caret {\n  border-width: 5px 5px 0;\n  border-bottom-width: 0;\n}\n.dropup .btn-lg .caret {\n  border-width: 0 5px 5px;\n}\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group,\n.btn-group-vertical > .btn-group > .btn {\n  display: block;\n  float: none;\n  width: 100%;\n  max-width: 100%;\n}\n.btn-group-vertical > .btn-group > .btn {\n  float: none;\n}\n.btn-group-vertical > .btn + .btn,\n.btn-group-vertical > .btn + .btn-group,\n.btn-group-vertical > .btn-group + .btn,\n.btn-group-vertical > .btn-group + .btn-group {\n  margin-top: -1px;\n  margin-left: 0;\n}\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-top-right-radius: 4px;\n  border-top-left-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.btn-group-justified {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate;\n}\n.btn-group-justified > .btn,\n.btn-group-justified > .btn-group {\n  float: none;\n  display: table-cell;\n  width: 1%;\n}\n.btn-group-justified > .btn-group .btn {\n  width: 100%;\n}\n.btn-group-justified > .btn-group .dropdown-menu {\n  left: auto;\n}\n[data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n.input-group {\n  position: relative;\n  display: table;\n  border-collapse: separate;\n}\n.input-group[class*=\"col-\"] {\n  float: none;\n  padding-left: 0;\n  padding-right: 0;\n}\n.input-group .form-control {\n  position: relative;\n  z-index: 2;\n  float: left;\n  width: 100%;\n  margin-bottom: 0;\n}\n.input-group .form-control:focus {\n  z-index: 3;\n}\n.input-group-lg > .form-control,\n.input-group-lg > .input-group-addon,\n.input-group-lg > .input-group-btn > .btn {\n  height: 66px;\n  padding: 18px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\nselect.input-group-lg > .form-control,\nselect.input-group-lg > .input-group-addon,\nselect.input-group-lg > .input-group-btn > .btn {\n  height: 66px;\n  line-height: 66px;\n}\ntextarea.input-group-lg > .form-control,\ntextarea.input-group-lg > .input-group-addon,\ntextarea.input-group-lg > .input-group-btn > .btn,\nselect[multiple].input-group-lg > .form-control,\nselect[multiple].input-group-lg > .input-group-addon,\nselect[multiple].input-group-lg > .input-group-btn > .btn {\n  height: auto;\n}\n.input-group-sm > .form-control,\n.input-group-sm > .input-group-addon,\n.input-group-sm > .input-group-btn > .btn {\n  height: 35px;\n  padding: 6px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\nselect.input-group-sm > .form-control,\nselect.input-group-sm > .input-group-addon,\nselect.input-group-sm > .input-group-btn > .btn {\n  height: 35px;\n  line-height: 35px;\n}\ntextarea.input-group-sm > .form-control,\ntextarea.input-group-sm > .input-group-addon,\ntextarea.input-group-sm > .input-group-btn > .btn,\nselect[multiple].input-group-sm > .form-control,\nselect[multiple].input-group-sm > .input-group-addon,\nselect[multiple].input-group-sm > .input-group-btn > .btn {\n  height: auto;\n}\n.input-group-addon,\n.input-group-btn,\n.input-group .form-control {\n  display: table-cell;\n}\n.input-group-addon:not(:first-child):not(:last-child),\n.input-group-btn:not(:first-child):not(:last-child),\n.input-group .form-control:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.input-group-addon,\n.input-group-btn {\n  width: 1%;\n  white-space: nowrap;\n  vertical-align: middle;\n}\n.input-group-addon {\n  padding: 10px 15px;\n  font-size: 15px;\n  font-weight: normal;\n  line-height: 1;\n  color: #2c3e50;\n  text-align: center;\n  background-color: #ecf0f1;\n  border: 1px solid #dce4ec;\n  border-radius: 4px;\n}\n.input-group-addon.input-sm {\n  padding: 6px 9px;\n  font-size: 13px;\n  border-radius: 3px;\n}\n.input-group-addon.input-lg {\n  padding: 18px 27px;\n  font-size: 19px;\n  border-radius: 6px;\n}\n.input-group-addon input[type=\"radio\"],\n.input-group-addon input[type=\"checkbox\"] {\n  margin-top: 0;\n}\n.input-group .form-control:first-child,\n.input-group-addon:first-child,\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group > .btn,\n.input-group-btn:first-child > .dropdown-toggle,\n.input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group-btn:last-child > .btn-group:not(:last-child) > .btn {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.input-group-addon:first-child {\n  border-right: 0;\n}\n.input-group .form-control:last-child,\n.input-group-addon:last-child,\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group > .btn,\n.input-group-btn:last-child > .dropdown-toggle,\n.input-group-btn:first-child > .btn:not(:first-child),\n.input-group-btn:first-child > .btn-group:not(:first-child) > .btn {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.input-group-addon:last-child {\n  border-left: 0;\n}\n.input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap;\n}\n.input-group-btn > .btn {\n  position: relative;\n}\n.input-group-btn > .btn + .btn {\n  margin-left: -1px;\n}\n.input-group-btn > .btn:hover,\n.input-group-btn > .btn:focus,\n.input-group-btn > .btn:active {\n  z-index: 2;\n}\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group {\n  margin-right: -1px;\n}\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group {\n  z-index: 2;\n  margin-left: -1px;\n}\n.nav {\n  margin-bottom: 0;\n  padding-left: 0;\n  list-style: none;\n}\n.nav > li {\n  position: relative;\n  display: block;\n}\n.nav > li > a {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n}\n.nav > li > a:hover,\n.nav > li > a:focus {\n  text-decoration: none;\n  background-color: #ecf0f1;\n}\n.nav > li.disabled > a {\n  color: #b4bcc2;\n}\n.nav > li.disabled > a:hover,\n.nav > li.disabled > a:focus {\n  color: #b4bcc2;\n  text-decoration: none;\n  background-color: transparent;\n  cursor: not-allowed;\n}\n.nav .open > a,\n.nav .open > a:hover,\n.nav .open > a:focus {\n  background-color: #ecf0f1;\n  border-color: #18bc9c;\n}\n.nav .nav-divider {\n  height: 1px;\n  margin: 9.5px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.nav > li > a > img {\n  max-width: none;\n}\n.nav-tabs {\n  border-bottom: 1px solid #ecf0f1;\n}\n.nav-tabs > li {\n  float: left;\n  margin-bottom: -1px;\n}\n.nav-tabs > li > a {\n  margin-right: 2px;\n  line-height: 1.42857143;\n  border: 1px solid transparent;\n  border-radius: 4px 4px 0 0;\n}\n.nav-tabs > li > a:hover {\n  border-color: #ecf0f1 #ecf0f1 #ecf0f1;\n}\n.nav-tabs > li.active > a,\n.nav-tabs > li.active > a:hover,\n.nav-tabs > li.active > a:focus {\n  color: #2c3e50;\n  background-color: #ffffff;\n  border: 1px solid #ecf0f1;\n  border-bottom-color: transparent;\n  cursor: default;\n}\n.nav-tabs.nav-justified {\n  width: 100%;\n  border-bottom: 0;\n}\n.nav-tabs.nav-justified > li {\n  float: none;\n}\n.nav-tabs.nav-justified > li > a {\n  text-align: center;\n  margin-bottom: 5px;\n}\n.nav-tabs.nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .nav-tabs.nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .nav-tabs.nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.nav-tabs.nav-justified > li > a {\n  margin-right: 0;\n  border-radius: 4px;\n}\n.nav-tabs.nav-justified > .active > a,\n.nav-tabs.nav-justified > .active > a:hover,\n.nav-tabs.nav-justified > .active > a:focus {\n  border: 1px solid #ecf0f1;\n}\n@media (min-width: 768px) {\n  .nav-tabs.nav-justified > li > a {\n    border-bottom: 1px solid #ecf0f1;\n    border-radius: 4px 4px 0 0;\n  }\n  .nav-tabs.nav-justified > .active > a,\n  .nav-tabs.nav-justified > .active > a:hover,\n  .nav-tabs.nav-justified > .active > a:focus {\n    border-bottom-color: #ffffff;\n  }\n}\n.nav-pills > li {\n  float: left;\n}\n.nav-pills > li > a {\n  border-radius: 4px;\n}\n.nav-pills > li + li {\n  margin-left: 2px;\n}\n.nav-pills > li.active > a,\n.nav-pills > li.active > a:hover,\n.nav-pills > li.active > a:focus {\n  color: #ffffff;\n  background-color: #2c3e50;\n}\n.nav-stacked > li {\n  float: none;\n}\n.nav-stacked > li + li {\n  margin-top: 2px;\n  margin-left: 0;\n}\n.nav-justified {\n  width: 100%;\n}\n.nav-justified > li {\n  float: none;\n}\n.nav-justified > li > a {\n  text-align: center;\n  margin-bottom: 5px;\n}\n.nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.nav-tabs-justified {\n  border-bottom: 0;\n}\n.nav-tabs-justified > li > a {\n  margin-right: 0;\n  border-radius: 4px;\n}\n.nav-tabs-justified > .active > a,\n.nav-tabs-justified > .active > a:hover,\n.nav-tabs-justified > .active > a:focus {\n  border: 1px solid #ecf0f1;\n}\n@media (min-width: 768px) {\n  .nav-tabs-justified > li > a {\n    border-bottom: 1px solid #ecf0f1;\n    border-radius: 4px 4px 0 0;\n  }\n  .nav-tabs-justified > .active > a,\n  .nav-tabs-justified > .active > a:hover,\n  .nav-tabs-justified > .active > a:focus {\n    border-bottom-color: #ffffff;\n  }\n}\n.tab-content > .tab-pane {\n  display: none;\n}\n.tab-content > .active {\n  display: block;\n}\n.nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.navbar {\n  position: relative;\n  min-height: 60px;\n  margin-bottom: 21px;\n  border: 1px solid transparent;\n}\n@media (min-width: 768px) {\n  .navbar {\n    border-radius: 4px;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-header {\n    float: left;\n  }\n}\n.navbar-collapse {\n  overflow-x: visible;\n  padding-right: 15px;\n  padding-left: 15px;\n  border-top: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  -webkit-overflow-scrolling: touch;\n}\n.navbar-collapse.in {\n  overflow-y: auto;\n}\n@media (min-width: 768px) {\n  .navbar-collapse {\n    width: auto;\n    border-top: 0;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n  }\n  .navbar-collapse.collapse {\n    display: block !important;\n    height: auto !important;\n    padding-bottom: 0;\n    overflow: visible !important;\n  }\n  .navbar-collapse.in {\n    overflow-y: visible;\n  }\n  .navbar-fixed-top .navbar-collapse,\n  .navbar-static-top .navbar-collapse,\n  .navbar-fixed-bottom .navbar-collapse {\n    padding-left: 0;\n    padding-right: 0;\n  }\n}\n.navbar-fixed-top .navbar-collapse,\n.navbar-fixed-bottom .navbar-collapse {\n  max-height: 340px;\n}\n@media (max-device-width: 480px) and (orientation: landscape) {\n  .navbar-fixed-top .navbar-collapse,\n  .navbar-fixed-bottom .navbar-collapse {\n    max-height: 200px;\n  }\n}\n.container > .navbar-header,\n.container-fluid > .navbar-header,\n.container > .navbar-collapse,\n.container-fluid > .navbar-collapse {\n  margin-right: -15px;\n  margin-left: -15px;\n}\n@media (min-width: 768px) {\n  .container > .navbar-header,\n  .container-fluid > .navbar-header,\n  .container > .navbar-collapse,\n  .container-fluid > .navbar-collapse {\n    margin-right: 0;\n    margin-left: 0;\n  }\n}\n.navbar-static-top {\n  z-index: 1000;\n  border-width: 0 0 1px;\n}\n@media (min-width: 768px) {\n  .navbar-static-top {\n    border-radius: 0;\n  }\n}\n.navbar-fixed-top,\n.navbar-fixed-bottom {\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n@media (min-width: 768px) {\n  .navbar-fixed-top,\n  .navbar-fixed-bottom {\n    border-radius: 0;\n  }\n}\n.navbar-fixed-top {\n  top: 0;\n  border-width: 0 0 1px;\n}\n.navbar-fixed-bottom {\n  bottom: 0;\n  margin-bottom: 0;\n  border-width: 1px 0 0;\n}\n.navbar-brand {\n  float: left;\n  padding: 19.5px 15px;\n  font-size: 19px;\n  line-height: 21px;\n  height: 60px;\n}\n.navbar-brand:hover,\n.navbar-brand:focus {\n  text-decoration: none;\n}\n.navbar-brand > img {\n  display: block;\n}\n@media (min-width: 768px) {\n  .navbar > .container .navbar-brand,\n  .navbar > .container-fluid .navbar-brand {\n    margin-left: -15px;\n  }\n}\n.navbar-toggle {\n  position: relative;\n  float: right;\n  margin-right: 15px;\n  padding: 9px 10px;\n  margin-top: 13px;\n  margin-bottom: 13px;\n  background-color: transparent;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 4px;\n}\n.navbar-toggle:focus {\n  outline: 0;\n}\n.navbar-toggle .icon-bar {\n  display: block;\n  width: 22px;\n  height: 2px;\n  border-radius: 1px;\n}\n.navbar-toggle .icon-bar + .icon-bar {\n  margin-top: 4px;\n}\n@media (min-width: 768px) {\n  .navbar-toggle {\n    display: none;\n  }\n}\n.navbar-nav {\n  margin: 9.75px -15px;\n}\n.navbar-nav > li > a {\n  padding-top: 10px;\n  padding-bottom: 10px;\n  line-height: 21px;\n}\n@media (max-width: 767px) {\n  .navbar-nav .open .dropdown-menu {\n    position: static;\n    float: none;\n    width: auto;\n    margin-top: 0;\n    background-color: transparent;\n    border: 0;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n  }\n  .navbar-nav .open .dropdown-menu > li > a,\n  .navbar-nav .open .dropdown-menu .dropdown-header {\n    padding: 5px 15px 5px 25px;\n  }\n  .navbar-nav .open .dropdown-menu > li > a {\n    line-height: 21px;\n  }\n  .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-nav .open .dropdown-menu > li > a:focus {\n    background-image: none;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-nav {\n    float: left;\n    margin: 0;\n  }\n  .navbar-nav > li {\n    float: left;\n  }\n  .navbar-nav > li > a {\n    padding-top: 19.5px;\n    padding-bottom: 19.5px;\n  }\n}\n.navbar-form {\n  margin-left: -15px;\n  margin-right: -15px;\n  padding: 10px 15px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  margin-top: 7.5px;\n  margin-bottom: 7.5px;\n}\n@media (min-width: 768px) {\n  .navbar-form .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .navbar-form .form-control-static {\n    display: inline-block;\n  }\n  .navbar-form .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .navbar-form .input-group .input-group-addon,\n  .navbar-form .input-group .input-group-btn,\n  .navbar-form .input-group .form-control {\n    width: auto;\n  }\n  .navbar-form .input-group > .form-control {\n    width: 100%;\n  }\n  .navbar-form .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .radio,\n  .navbar-form .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .radio label,\n  .navbar-form .checkbox label {\n    padding-left: 0;\n  }\n  .navbar-form .radio input[type=\"radio\"],\n  .navbar-form .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .navbar-form .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n@media (max-width: 767px) {\n  .navbar-form .form-group {\n    margin-bottom: 5px;\n  }\n  .navbar-form .form-group:last-child {\n    margin-bottom: 0;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-form {\n    width: auto;\n    border: 0;\n    margin-left: 0;\n    margin-right: 0;\n    padding-top: 0;\n    padding-bottom: 0;\n    -webkit-box-shadow: none;\n    box-shadow: none;\n  }\n}\n.navbar-nav > li > .dropdown-menu {\n  margin-top: 0;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {\n  margin-bottom: 0;\n  border-top-right-radius: 4px;\n  border-top-left-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.navbar-btn {\n  margin-top: 7.5px;\n  margin-bottom: 7.5px;\n}\n.navbar-btn.btn-sm {\n  margin-top: 12.5px;\n  margin-bottom: 12.5px;\n}\n.navbar-btn.btn-xs {\n  margin-top: 19px;\n  margin-bottom: 19px;\n}\n.navbar-text {\n  margin-top: 19.5px;\n  margin-bottom: 19.5px;\n}\n@media (min-width: 768px) {\n  .navbar-text {\n    float: left;\n    margin-left: 15px;\n    margin-right: 15px;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-left {\n    float: left !important;\n  }\n  .navbar-right {\n    float: right !important;\n    margin-right: -15px;\n  }\n  .navbar-right ~ .navbar-right {\n    margin-right: 0;\n  }\n}\n.navbar-default {\n  background-color: #2c3e50;\n  border-color: transparent;\n}\n.navbar-default .navbar-brand {\n  color: #ffffff;\n}\n.navbar-default .navbar-brand:hover,\n.navbar-default .navbar-brand:focus {\n  color: #18bc9c;\n  background-color: transparent;\n}\n.navbar-default .navbar-text {\n  color: #ffffff;\n}\n.navbar-default .navbar-nav > li > a {\n  color: #ffffff;\n}\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus {\n  color: #18bc9c;\n  background-color: transparent;\n}\n.navbar-default .navbar-nav > .active > a,\n.navbar-default .navbar-nav > .active > a:hover,\n.navbar-default .navbar-nav > .active > a:focus {\n  color: #ffffff;\n  background-color: #1a242f;\n}\n.navbar-default .navbar-nav > .disabled > a,\n.navbar-default .navbar-nav > .disabled > a:hover,\n.navbar-default .navbar-nav > .disabled > a:focus {\n  color: #cccccc;\n  background-color: transparent;\n}\n.navbar-default .navbar-toggle {\n  border-color: #1a242f;\n}\n.navbar-default .navbar-toggle:hover,\n.navbar-default .navbar-toggle:focus {\n  background-color: #1a242f;\n}\n.navbar-default .navbar-toggle .icon-bar {\n  background-color: #ffffff;\n}\n.navbar-default .navbar-collapse,\n.navbar-default .navbar-form {\n  border-color: transparent;\n}\n.navbar-default .navbar-nav > .open > a,\n.navbar-default .navbar-nav > .open > a:hover,\n.navbar-default .navbar-nav > .open > a:focus {\n  background-color: #1a242f;\n  color: #ffffff;\n}\n@media (max-width: 767px) {\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a {\n    color: #ffffff;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #18bc9c;\n    background-color: transparent;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a,\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #ffffff;\n    background-color: #1a242f;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a,\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #cccccc;\n    background-color: transparent;\n  }\n}\n.navbar-default .navbar-link {\n  color: #ffffff;\n}\n.navbar-default .navbar-link:hover {\n  color: #18bc9c;\n}\n.navbar-default .btn-link {\n  color: #ffffff;\n}\n.navbar-default .btn-link:hover,\n.navbar-default .btn-link:focus {\n  color: #18bc9c;\n}\n.navbar-default .btn-link[disabled]:hover,\nfieldset[disabled] .navbar-default .btn-link:hover,\n.navbar-default .btn-link[disabled]:focus,\nfieldset[disabled] .navbar-default .btn-link:focus {\n  color: #cccccc;\n}\n.navbar-inverse {\n  background-color: #18bc9c;\n  border-color: transparent;\n}\n.navbar-inverse .navbar-brand {\n  color: #ffffff;\n}\n.navbar-inverse .navbar-brand:hover,\n.navbar-inverse .navbar-brand:focus {\n  color: #2c3e50;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-text {\n  color: #ffffff;\n}\n.navbar-inverse .navbar-nav > li > a {\n  color: #ffffff;\n}\n.navbar-inverse .navbar-nav > li > a:hover,\n.navbar-inverse .navbar-nav > li > a:focus {\n  color: #2c3e50;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-nav > .active > a,\n.navbar-inverse .navbar-nav > .active > a:hover,\n.navbar-inverse .navbar-nav > .active > a:focus {\n  color: #ffffff;\n  background-color: #15a589;\n}\n.navbar-inverse .navbar-nav > .disabled > a,\n.navbar-inverse .navbar-nav > .disabled > a:hover,\n.navbar-inverse .navbar-nav > .disabled > a:focus {\n  color: #cccccc;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-toggle {\n  border-color: #128f76;\n}\n.navbar-inverse .navbar-toggle:hover,\n.navbar-inverse .navbar-toggle:focus {\n  background-color: #128f76;\n}\n.navbar-inverse .navbar-toggle .icon-bar {\n  background-color: #ffffff;\n}\n.navbar-inverse .navbar-collapse,\n.navbar-inverse .navbar-form {\n  border-color: #149c82;\n}\n.navbar-inverse .navbar-nav > .open > a,\n.navbar-inverse .navbar-nav > .open > a:hover,\n.navbar-inverse .navbar-nav > .open > a:focus {\n  background-color: #15a589;\n  color: #ffffff;\n}\n@media (max-width: 767px) {\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {\n    border-color: transparent;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu .divider {\n    background-color: transparent;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {\n    color: #ffffff;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #2c3e50;\n    background-color: transparent;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #ffffff;\n    background-color: #15a589;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #cccccc;\n    background-color: transparent;\n  }\n}\n.navbar-inverse .navbar-link {\n  color: #ffffff;\n}\n.navbar-inverse .navbar-link:hover {\n  color: #2c3e50;\n}\n.navbar-inverse .btn-link {\n  color: #ffffff;\n}\n.navbar-inverse .btn-link:hover,\n.navbar-inverse .btn-link:focus {\n  color: #2c3e50;\n}\n.navbar-inverse .btn-link[disabled]:hover,\nfieldset[disabled] .navbar-inverse .btn-link:hover,\n.navbar-inverse .btn-link[disabled]:focus,\nfieldset[disabled] .navbar-inverse .btn-link:focus {\n  color: #cccccc;\n}\n.breadcrumb {\n  padding: 8px 15px;\n  margin-bottom: 21px;\n  list-style: none;\n  background-color: #ecf0f1;\n  border-radius: 4px;\n}\n.breadcrumb > li {\n  display: inline-block;\n}\n.breadcrumb > li + li:before {\n  content: \"/\\A0\";\n  padding: 0 5px;\n  color: #cccccc;\n}\n.breadcrumb > .active {\n  color: #95a5a6;\n}\n.pagination {\n  display: inline-block;\n  padding-left: 0;\n  margin: 21px 0;\n  border-radius: 4px;\n}\n.pagination > li {\n  display: inline;\n}\n.pagination > li > a,\n.pagination > li > span {\n  position: relative;\n  float: left;\n  padding: 10px 15px;\n  line-height: 1.42857143;\n  text-decoration: none;\n  color: #ffffff;\n  background-color: #18bc9c;\n  border: 1px solid transparent;\n  margin-left: -1px;\n}\n.pagination > li:first-child > a,\n.pagination > li:first-child > span {\n  margin-left: 0;\n  border-bottom-left-radius: 4px;\n  border-top-left-radius: 4px;\n}\n.pagination > li:last-child > a,\n.pagination > li:last-child > span {\n  border-bottom-right-radius: 4px;\n  border-top-right-radius: 4px;\n}\n.pagination > li > a:hover,\n.pagination > li > span:hover,\n.pagination > li > a:focus,\n.pagination > li > span:focus {\n  z-index: 2;\n  color: #ffffff;\n  background-color: #0f7864;\n  border-color: transparent;\n}\n.pagination > .active > a,\n.pagination > .active > span,\n.pagination > .active > a:hover,\n.pagination > .active > span:hover,\n.pagination > .active > a:focus,\n.pagination > .active > span:focus {\n  z-index: 3;\n  color: #ffffff;\n  background-color: #0f7864;\n  border-color: transparent;\n  cursor: default;\n}\n.pagination > .disabled > span,\n.pagination > .disabled > span:hover,\n.pagination > .disabled > span:focus,\n.pagination > .disabled > a,\n.pagination > .disabled > a:hover,\n.pagination > .disabled > a:focus {\n  color: #ecf0f1;\n  background-color: #3be6c4;\n  border-color: transparent;\n  cursor: not-allowed;\n}\n.pagination-lg > li > a,\n.pagination-lg > li > span {\n  padding: 18px 27px;\n  font-size: 19px;\n  line-height: 1.3333333;\n}\n.pagination-lg > li:first-child > a,\n.pagination-lg > li:first-child > span {\n  border-bottom-left-radius: 6px;\n  border-top-left-radius: 6px;\n}\n.pagination-lg > li:last-child > a,\n.pagination-lg > li:last-child > span {\n  border-bottom-right-radius: 6px;\n  border-top-right-radius: 6px;\n}\n.pagination-sm > li > a,\n.pagination-sm > li > span {\n  padding: 6px 9px;\n  font-size: 13px;\n  line-height: 1.5;\n}\n.pagination-sm > li:first-child > a,\n.pagination-sm > li:first-child > span {\n  border-bottom-left-radius: 3px;\n  border-top-left-radius: 3px;\n}\n.pagination-sm > li:last-child > a,\n.pagination-sm > li:last-child > span {\n  border-bottom-right-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.pager {\n  padding-left: 0;\n  margin: 21px 0;\n  list-style: none;\n  text-align: center;\n}\n.pager li {\n  display: inline;\n}\n.pager li > a,\n.pager li > span {\n  display: inline-block;\n  padding: 5px 14px;\n  background-color: #18bc9c;\n  border: 1px solid transparent;\n  border-radius: 15px;\n}\n.pager li > a:hover,\n.pager li > a:focus {\n  text-decoration: none;\n  background-color: #0f7864;\n}\n.pager .next > a,\n.pager .next > span {\n  float: right;\n}\n.pager .previous > a,\n.pager .previous > span {\n  float: left;\n}\n.pager .disabled > a,\n.pager .disabled > a:hover,\n.pager .disabled > a:focus,\n.pager .disabled > span {\n  color: #ffffff;\n  background-color: #18bc9c;\n  cursor: not-allowed;\n}\n.label {\n  display: inline;\n  padding: .2em .6em .3em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #ffffff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: .25em;\n}\na.label:hover,\na.label:focus {\n  color: #ffffff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.label:empty {\n  display: none;\n}\n.btn .label {\n  position: relative;\n  top: -1px;\n}\n.label-default {\n  background-color: #95a5a6;\n}\n.label-default[href]:hover,\n.label-default[href]:focus {\n  background-color: #798d8f;\n}\n.label-primary {\n  background-color: #2c3e50;\n}\n.label-primary[href]:hover,\n.label-primary[href]:focus {\n  background-color: #1a242f;\n}\n.label-success {\n  background-color: #18bc9c;\n}\n.label-success[href]:hover,\n.label-success[href]:focus {\n  background-color: #128f76;\n}\n.label-info {\n  background-color: #3498db;\n}\n.label-info[href]:hover,\n.label-info[href]:focus {\n  background-color: #217dbb;\n}\n.label-warning {\n  background-color: #f39c12;\n}\n.label-warning[href]:hover,\n.label-warning[href]:focus {\n  background-color: #c87f0a;\n}\n.label-danger {\n  background-color: #e74c3c;\n}\n.label-danger[href]:hover,\n.label-danger[href]:focus {\n  background-color: #d62c1a;\n}\n.badge {\n  display: inline-block;\n  min-width: 10px;\n  padding: 3px 7px;\n  font-size: 13px;\n  font-weight: bold;\n  color: #ffffff;\n  line-height: 1;\n  vertical-align: middle;\n  white-space: nowrap;\n  text-align: center;\n  background-color: #2c3e50;\n  border-radius: 10px;\n}\n.badge:empty {\n  display: none;\n}\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n.btn-xs .badge,\n.btn-group-xs > .btn .badge {\n  top: 0;\n  padding: 1px 5px;\n}\na.badge:hover,\na.badge:focus {\n  color: #ffffff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.list-group-item.active > .badge,\n.nav-pills > .active > a > .badge {\n  color: #2c3e50;\n  background-color: #ffffff;\n}\n.list-group-item > .badge {\n  float: right;\n}\n.list-group-item > .badge + .badge {\n  margin-right: 5px;\n}\n.nav-pills > li > a > .badge {\n  margin-left: 3px;\n}\n.jumbotron {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #ecf0f1;\n}\n.jumbotron h1,\n.jumbotron .h1 {\n  color: inherit;\n}\n.jumbotron p {\n  margin-bottom: 15px;\n  font-size: 23px;\n  font-weight: 200;\n}\n.jumbotron > hr {\n  border-top-color: #cfd9db;\n}\n.container .jumbotron,\n.container-fluid .jumbotron {\n  border-radius: 6px;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.jumbotron .container {\n  max-width: 100%;\n}\n@media screen and (min-width: 768px) {\n  .jumbotron {\n    padding-top: 48px;\n    padding-bottom: 48px;\n  }\n  .container .jumbotron,\n  .container-fluid .jumbotron {\n    padding-left: 60px;\n    padding-right: 60px;\n  }\n  .jumbotron h1,\n  .jumbotron .h1 {\n    font-size: 68px;\n  }\n}\n.thumbnail {\n  display: block;\n  padding: 4px;\n  margin-bottom: 21px;\n  line-height: 1.42857143;\n  background-color: #ffffff;\n  border: 1px solid #ecf0f1;\n  border-radius: 4px;\n  -webkit-transition: border 0.2s ease-in-out;\n  -o-transition: border 0.2s ease-in-out;\n  transition: border 0.2s ease-in-out;\n}\n.thumbnail > img,\n.thumbnail a > img {\n  margin-left: auto;\n  margin-right: auto;\n}\na.thumbnail:hover,\na.thumbnail:focus,\na.thumbnail.active {\n  border-color: #18bc9c;\n}\n.thumbnail .caption {\n  padding: 9px;\n  color: #2c3e50;\n}\n.alert {\n  padding: 15px;\n  margin-bottom: 21px;\n  border: 1px solid transparent;\n  border-radius: 4px;\n}\n.alert h4 {\n  margin-top: 0;\n  color: inherit;\n}\n.alert .alert-link {\n  font-weight: bold;\n}\n.alert > p,\n.alert > ul {\n  margin-bottom: 0;\n}\n.alert > p + p {\n  margin-top: 5px;\n}\n.alert-dismissable,\n.alert-dismissible {\n  padding-right: 35px;\n}\n.alert-dismissable .close,\n.alert-dismissible .close {\n  position: relative;\n  top: -2px;\n  right: -21px;\n  color: inherit;\n}\n.alert-success {\n  background-color: #18bc9c;\n  border-color: #18bc9c;\n  color: #ffffff;\n}\n.alert-success hr {\n  border-top-color: #15a589;\n}\n.alert-success .alert-link {\n  color: #e6e6e6;\n}\n.alert-info {\n  background-color: #3498db;\n  border-color: #3498db;\n  color: #ffffff;\n}\n.alert-info hr {\n  border-top-color: #258cd1;\n}\n.alert-info .alert-link {\n  color: #e6e6e6;\n}\n.alert-warning {\n  background-color: #f39c12;\n  border-color: #f39c12;\n  color: #ffffff;\n}\n.alert-warning hr {\n  border-top-color: #e08e0b;\n}\n.alert-warning .alert-link {\n  color: #e6e6e6;\n}\n.alert-danger {\n  background-color: #e74c3c;\n  border-color: #e74c3c;\n  color: #ffffff;\n}\n.alert-danger hr {\n  border-top-color: #e43725;\n}\n.alert-danger .alert-link {\n  color: #e6e6e6;\n}\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n@-o-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n.progress {\n  overflow: hidden;\n  height: 21px;\n  margin-bottom: 21px;\n  background-color: #ecf0f1;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);\n}\n.progress-bar {\n  float: left;\n  width: 0%;\n  height: 100%;\n  font-size: 13px;\n  line-height: 21px;\n  color: #ffffff;\n  text-align: center;\n  background-color: #2c3e50;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  -webkit-transition: width 0.6s ease;\n  -o-transition: width 0.6s ease;\n  transition: width 0.6s ease;\n}\n.progress-striped .progress-bar,\n.progress-bar-striped {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  -webkit-background-size: 40px 40px;\n          background-size: 40px 40px;\n}\n.progress.active .progress-bar,\n.progress-bar.active {\n  -webkit-animation: progress-bar-stripes 2s linear infinite;\n  -o-animation: progress-bar-stripes 2s linear infinite;\n  animation: progress-bar-stripes 2s linear infinite;\n}\n.progress-bar-success {\n  background-color: #18bc9c;\n}\n.progress-striped .progress-bar-success {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.progress-bar-info {\n  background-color: #3498db;\n}\n.progress-striped .progress-bar-info {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.progress-bar-warning {\n  background-color: #f39c12;\n}\n.progress-striped .progress-bar-warning {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.progress-bar-danger {\n  background-color: #e74c3c;\n}\n.progress-striped .progress-bar-danger {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.media {\n  margin-top: 15px;\n}\n.media:first-child {\n  margin-top: 0;\n}\n.media,\n.media-body {\n  zoom: 1;\n  overflow: hidden;\n}\n.media-body {\n  width: 10000px;\n}\n.media-object {\n  display: block;\n}\n.media-object.img-thumbnail {\n  max-width: none;\n}\n.media-right,\n.media > .pull-right {\n  padding-left: 10px;\n}\n.media-left,\n.media > .pull-left {\n  padding-right: 10px;\n}\n.media-left,\n.media-right,\n.media-body {\n  display: table-cell;\n  vertical-align: top;\n}\n.media-middle {\n  vertical-align: middle;\n}\n.media-bottom {\n  vertical-align: bottom;\n}\n.media-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.media-list {\n  padding-left: 0;\n  list-style: none;\n}\n.list-group {\n  margin-bottom: 20px;\n  padding-left: 0;\n}\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n  margin-bottom: -1px;\n  background-color: #ffffff;\n  border: 1px solid #ecf0f1;\n}\n.list-group-item:first-child {\n  border-top-right-radius: 4px;\n  border-top-left-radius: 4px;\n}\n.list-group-item:last-child {\n  margin-bottom: 0;\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\na.list-group-item,\nbutton.list-group-item {\n  color: #555555;\n}\na.list-group-item .list-group-item-heading,\nbutton.list-group-item .list-group-item-heading {\n  color: #333333;\n}\na.list-group-item:hover,\nbutton.list-group-item:hover,\na.list-group-item:focus,\nbutton.list-group-item:focus {\n  text-decoration: none;\n  color: #555555;\n  background-color: #ecf0f1;\n}\nbutton.list-group-item {\n  width: 100%;\n  text-align: left;\n}\n.list-group-item.disabled,\n.list-group-item.disabled:hover,\n.list-group-item.disabled:focus {\n  background-color: #ecf0f1;\n  color: #b4bcc2;\n  cursor: not-allowed;\n}\n.list-group-item.disabled .list-group-item-heading,\n.list-group-item.disabled:hover .list-group-item-heading,\n.list-group-item.disabled:focus .list-group-item-heading {\n  color: inherit;\n}\n.list-group-item.disabled .list-group-item-text,\n.list-group-item.disabled:hover .list-group-item-text,\n.list-group-item.disabled:focus .list-group-item-text {\n  color: #b4bcc2;\n}\n.list-group-item.active,\n.list-group-item.active:hover,\n.list-group-item.active:focus {\n  z-index: 2;\n  color: #ffffff;\n  background-color: #2c3e50;\n  border-color: #2c3e50;\n}\n.list-group-item.active .list-group-item-heading,\n.list-group-item.active:hover .list-group-item-heading,\n.list-group-item.active:focus .list-group-item-heading,\n.list-group-item.active .list-group-item-heading > small,\n.list-group-item.active:hover .list-group-item-heading > small,\n.list-group-item.active:focus .list-group-item-heading > small,\n.list-group-item.active .list-group-item-heading > .small,\n.list-group-item.active:hover .list-group-item-heading > .small,\n.list-group-item.active:focus .list-group-item-heading > .small {\n  color: inherit;\n}\n.list-group-item.active .list-group-item-text,\n.list-group-item.active:hover .list-group-item-text,\n.list-group-item.active:focus .list-group-item-text {\n  color: #8aa4be;\n}\n.list-group-item-success {\n  color: #ffffff;\n  background-color: #18bc9c;\n}\na.list-group-item-success,\nbutton.list-group-item-success {\n  color: #ffffff;\n}\na.list-group-item-success .list-group-item-heading,\nbutton.list-group-item-success .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-success:hover,\nbutton.list-group-item-success:hover,\na.list-group-item-success:focus,\nbutton.list-group-item-success:focus {\n  color: #ffffff;\n  background-color: #15a589;\n}\na.list-group-item-success.active,\nbutton.list-group-item-success.active,\na.list-group-item-success.active:hover,\nbutton.list-group-item-success.active:hover,\na.list-group-item-success.active:focus,\nbutton.list-group-item-success.active:focus {\n  color: #fff;\n  background-color: #ffffff;\n  border-color: #ffffff;\n}\n.list-group-item-info {\n  color: #ffffff;\n  background-color: #3498db;\n}\na.list-group-item-info,\nbutton.list-group-item-info {\n  color: #ffffff;\n}\na.list-group-item-info .list-group-item-heading,\nbutton.list-group-item-info .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-info:hover,\nbutton.list-group-item-info:hover,\na.list-group-item-info:focus,\nbutton.list-group-item-info:focus {\n  color: #ffffff;\n  background-color: #258cd1;\n}\na.list-group-item-info.active,\nbutton.list-group-item-info.active,\na.list-group-item-info.active:hover,\nbutton.list-group-item-info.active:hover,\na.list-group-item-info.active:focus,\nbutton.list-group-item-info.active:focus {\n  color: #fff;\n  background-color: #ffffff;\n  border-color: #ffffff;\n}\n.list-group-item-warning {\n  color: #ffffff;\n  background-color: #f39c12;\n}\na.list-group-item-warning,\nbutton.list-group-item-warning {\n  color: #ffffff;\n}\na.list-group-item-warning .list-group-item-heading,\nbutton.list-group-item-warning .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-warning:hover,\nbutton.list-group-item-warning:hover,\na.list-group-item-warning:focus,\nbutton.list-group-item-warning:focus {\n  color: #ffffff;\n  background-color: #e08e0b;\n}\na.list-group-item-warning.active,\nbutton.list-group-item-warning.active,\na.list-group-item-warning.active:hover,\nbutton.list-group-item-warning.active:hover,\na.list-group-item-warning.active:focus,\nbutton.list-group-item-warning.active:focus {\n  color: #fff;\n  background-color: #ffffff;\n  border-color: #ffffff;\n}\n.list-group-item-danger {\n  color: #ffffff;\n  background-color: #e74c3c;\n}\na.list-group-item-danger,\nbutton.list-group-item-danger {\n  color: #ffffff;\n}\na.list-group-item-danger .list-group-item-heading,\nbutton.list-group-item-danger .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-danger:hover,\nbutton.list-group-item-danger:hover,\na.list-group-item-danger:focus,\nbutton.list-group-item-danger:focus {\n  color: #ffffff;\n  background-color: #e43725;\n}\na.list-group-item-danger.active,\nbutton.list-group-item-danger.active,\na.list-group-item-danger.active:hover,\nbutton.list-group-item-danger.active:hover,\na.list-group-item-danger.active:focus,\nbutton.list-group-item-danger.active:focus {\n  color: #fff;\n  background-color: #ffffff;\n  border-color: #ffffff;\n}\n.list-group-item-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.list-group-item-text {\n  margin-bottom: 0;\n  line-height: 1.3;\n}\n.panel {\n  margin-bottom: 21px;\n  background-color: #ffffff;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);\n}\n.panel-body {\n  padding: 15px;\n}\n.panel-heading {\n  padding: 10px 15px;\n  border-bottom: 1px solid transparent;\n  border-top-right-radius: 3px;\n  border-top-left-radius: 3px;\n}\n.panel-heading > .dropdown .dropdown-toggle {\n  color: inherit;\n}\n.panel-title {\n  margin-top: 0;\n  margin-bottom: 0;\n  font-size: 17px;\n  color: inherit;\n}\n.panel-title > a,\n.panel-title > small,\n.panel-title > .small,\n.panel-title > small > a,\n.panel-title > .small > a {\n  color: inherit;\n}\n.panel-footer {\n  padding: 10px 15px;\n  background-color: #ecf0f1;\n  border-top: 1px solid #ecf0f1;\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .list-group,\n.panel > .panel-collapse > .list-group {\n  margin-bottom: 0;\n}\n.panel > .list-group .list-group-item,\n.panel > .panel-collapse > .list-group .list-group-item {\n  border-width: 1px 0;\n  border-radius: 0;\n}\n.panel > .list-group:first-child .list-group-item:first-child,\n.panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {\n  border-top: 0;\n  border-top-right-radius: 3px;\n  border-top-left-radius: 3px;\n}\n.panel > .list-group:last-child .list-group-item:last-child,\n.panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {\n  border-bottom: 0;\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.panel-heading + .list-group .list-group-item:first-child {\n  border-top-width: 0;\n}\n.list-group + .panel-footer {\n  border-top-width: 0;\n}\n.panel > .table,\n.panel > .table-responsive > .table,\n.panel > .panel-collapse > .table {\n  margin-bottom: 0;\n}\n.panel > .table caption,\n.panel > .table-responsive > .table caption,\n.panel > .panel-collapse > .table caption {\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.panel > .table:first-child,\n.panel > .table-responsive:first-child > .table:first-child {\n  border-top-right-radius: 3px;\n  border-top-left-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.panel > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {\n  border-top-left-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.panel > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {\n  border-top-right-radius: 3px;\n}\n.panel > .table:last-child,\n.panel > .table-responsive:last-child > .table:last-child {\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {\n  border-bottom-left-radius: 3px;\n  border-bottom-right-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {\n  border-bottom-left-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {\n  border-bottom-right-radius: 3px;\n}\n.panel > .panel-body + .table,\n.panel > .panel-body + .table-responsive,\n.panel > .table + .panel-body,\n.panel > .table-responsive + .panel-body {\n  border-top: 1px solid #ecf0f1;\n}\n.panel > .table > tbody:first-child > tr:first-child th,\n.panel > .table > tbody:first-child > tr:first-child td {\n  border-top: 0;\n}\n.panel > .table-bordered,\n.panel > .table-responsive > .table-bordered {\n  border: 0;\n}\n.panel > .table-bordered > thead > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > thead > tr > th:first-child,\n.panel > .table-bordered > tbody > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,\n.panel > .table-bordered > tfoot > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n.panel > .table-bordered > thead > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > thead > tr > td:first-child,\n.panel > .table-bordered > tbody > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,\n.panel > .table-bordered > tfoot > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n  border-left: 0;\n}\n.panel > .table-bordered > thead > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > thead > tr > th:last-child,\n.panel > .table-bordered > tbody > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,\n.panel > .table-bordered > tfoot > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n.panel > .table-bordered > thead > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > thead > tr > td:last-child,\n.panel > .table-bordered > tbody > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,\n.panel > .table-bordered > tfoot > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n  border-right: 0;\n}\n.panel > .table-bordered > thead > tr:first-child > td,\n.panel > .table-responsive > .table-bordered > thead > tr:first-child > td,\n.panel > .table-bordered > tbody > tr:first-child > td,\n.panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,\n.panel > .table-bordered > thead > tr:first-child > th,\n.panel > .table-responsive > .table-bordered > thead > tr:first-child > th,\n.panel > .table-bordered > tbody > tr:first-child > th,\n.panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {\n  border-bottom: 0;\n}\n.panel > .table-bordered > tbody > tr:last-child > td,\n.panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,\n.panel > .table-bordered > tfoot > tr:last-child > td,\n.panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,\n.panel > .table-bordered > tbody > tr:last-child > th,\n.panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,\n.panel > .table-bordered > tfoot > tr:last-child > th,\n.panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {\n  border-bottom: 0;\n}\n.panel > .table-responsive {\n  border: 0;\n  margin-bottom: 0;\n}\n.panel-group {\n  margin-bottom: 21px;\n}\n.panel-group .panel {\n  margin-bottom: 0;\n  border-radius: 4px;\n}\n.panel-group .panel + .panel {\n  margin-top: 5px;\n}\n.panel-group .panel-heading {\n  border-bottom: 0;\n}\n.panel-group .panel-heading + .panel-collapse > .panel-body,\n.panel-group .panel-heading + .panel-collapse > .list-group {\n  border-top: 1px solid #ecf0f1;\n}\n.panel-group .panel-footer {\n  border-top: 0;\n}\n.panel-group .panel-footer + .panel-collapse .panel-body {\n  border-bottom: 1px solid #ecf0f1;\n}\n.panel-default {\n  border-color: #ecf0f1;\n}\n.panel-default > .panel-heading {\n  color: #2c3e50;\n  background-color: #ecf0f1;\n  border-color: #ecf0f1;\n}\n.panel-default > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #ecf0f1;\n}\n.panel-default > .panel-heading .badge {\n  color: #ecf0f1;\n  background-color: #2c3e50;\n}\n.panel-default > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #ecf0f1;\n}\n.panel-primary {\n  border-color: #2c3e50;\n}\n.panel-primary > .panel-heading {\n  color: #ffffff;\n  background-color: #2c3e50;\n  border-color: #2c3e50;\n}\n.panel-primary > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #2c3e50;\n}\n.panel-primary > .panel-heading .badge {\n  color: #2c3e50;\n  background-color: #ffffff;\n}\n.panel-primary > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #2c3e50;\n}\n.panel-success {\n  border-color: #18bc9c;\n}\n.panel-success > .panel-heading {\n  color: #ffffff;\n  background-color: #18bc9c;\n  border-color: #18bc9c;\n}\n.panel-success > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #18bc9c;\n}\n.panel-success > .panel-heading .badge {\n  color: #18bc9c;\n  background-color: #ffffff;\n}\n.panel-success > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #18bc9c;\n}\n.panel-info {\n  border-color: #3498db;\n}\n.panel-info > .panel-heading {\n  color: #ffffff;\n  background-color: #3498db;\n  border-color: #3498db;\n}\n.panel-info > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #3498db;\n}\n.panel-info > .panel-heading .badge {\n  color: #3498db;\n  background-color: #ffffff;\n}\n.panel-info > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #3498db;\n}\n.panel-warning {\n  border-color: #f39c12;\n}\n.panel-warning > .panel-heading {\n  color: #ffffff;\n  background-color: #f39c12;\n  border-color: #f39c12;\n}\n.panel-warning > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #f39c12;\n}\n.panel-warning > .panel-heading .badge {\n  color: #f39c12;\n  background-color: #ffffff;\n}\n.panel-warning > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #f39c12;\n}\n.panel-danger {\n  border-color: #e74c3c;\n}\n.panel-danger > .panel-heading {\n  color: #ffffff;\n  background-color: #e74c3c;\n  border-color: #e74c3c;\n}\n.panel-danger > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #e74c3c;\n}\n.panel-danger > .panel-heading .badge {\n  color: #e74c3c;\n  background-color: #ffffff;\n}\n.panel-danger > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #e74c3c;\n}\n.embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden;\n}\n.embed-responsive .embed-responsive-item,\n.embed-responsive iframe,\n.embed-responsive embed,\n.embed-responsive object,\n.embed-responsive video {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  height: 100%;\n  width: 100%;\n  border: 0;\n}\n.embed-responsive-16by9 {\n  padding-bottom: 56.25%;\n}\n.embed-responsive-4by3 {\n  padding-bottom: 75%;\n}\n.well {\n  min-height: 20px;\n  padding: 19px;\n  margin-bottom: 20px;\n  background-color: #ecf0f1;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\n}\n.well blockquote {\n  border-color: #ddd;\n  border-color: rgba(0, 0, 0, 0.15);\n}\n.well-lg {\n  padding: 24px;\n  border-radius: 6px;\n}\n.well-sm {\n  padding: 9px;\n  border-radius: 3px;\n}\n.close {\n  float: right;\n  font-size: 22.5px;\n  font-weight: bold;\n  line-height: 1;\n  color: #000000;\n  text-shadow: none;\n  opacity: 0.2;\n  filter: alpha(opacity=20);\n}\n.close:hover,\n.close:focus {\n  color: #000000;\n  text-decoration: none;\n  cursor: pointer;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n}\nbutton.close {\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n}\n.modal-open {\n  overflow: hidden;\n}\n.modal {\n  display: none;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  -webkit-overflow-scrolling: touch;\n  outline: 0;\n}\n.modal.fade .modal-dialog {\n  -webkit-transform: translate(0, -25%);\n  -ms-transform: translate(0, -25%);\n  -o-transform: translate(0, -25%);\n  transform: translate(0, -25%);\n  -webkit-transition: -webkit-transform 0.3s ease-out;\n  -o-transition: -o-transform 0.3s ease-out;\n  transition: transform 0.3s ease-out;\n}\n.modal.in .modal-dialog {\n  -webkit-transform: translate(0, 0);\n  -ms-transform: translate(0, 0);\n  -o-transform: translate(0, 0);\n  transform: translate(0, 0);\n}\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 10px;\n}\n.modal-content {\n  position: relative;\n  background-color: #ffffff;\n  border: 1px solid #999999;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 6px;\n  -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n  outline: 0;\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000000;\n}\n.modal-backdrop.fade {\n  opacity: 0;\n  filter: alpha(opacity=0);\n}\n.modal-backdrop.in {\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n}\n.modal-header {\n  padding: 15px;\n  border-bottom: 1px solid #e5e5e5;\n}\n.modal-header .close {\n  margin-top: -2px;\n}\n.modal-title {\n  margin: 0;\n  line-height: 1.42857143;\n}\n.modal-body {\n  position: relative;\n  padding: 20px;\n}\n.modal-footer {\n  padding: 20px;\n  text-align: right;\n  border-top: 1px solid #e5e5e5;\n}\n.modal-footer .btn + .btn {\n  margin-left: 5px;\n  margin-bottom: 0;\n}\n.modal-footer .btn-group .btn + .btn {\n  margin-left: -1px;\n}\n.modal-footer .btn-block + .btn-block {\n  margin-left: 0;\n}\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n@media (min-width: 768px) {\n  .modal-dialog {\n    width: 600px;\n    margin: 30px auto;\n  }\n  .modal-content {\n    -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n  }\n  .modal-sm {\n    width: 300px;\n  }\n}\n@media (min-width: 992px) {\n  .modal-lg {\n    width: 900px;\n  }\n}\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  font-family: \"Lato\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 13px;\n  opacity: 0;\n  filter: alpha(opacity=0);\n}\n.tooltip.in {\n  opacity: 0.9;\n  filter: alpha(opacity=90);\n}\n.tooltip.top {\n  margin-top: -3px;\n  padding: 5px 0;\n}\n.tooltip.right {\n  margin-left: 3px;\n  padding: 0 5px;\n}\n.tooltip.bottom {\n  margin-top: 3px;\n  padding: 5px 0;\n}\n.tooltip.left {\n  margin-left: -3px;\n  padding: 0 5px;\n}\n.tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #ffffff;\n  text-align: center;\n  background-color: #000000;\n  border-radius: 4px;\n}\n.tooltip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.tooltip.top .tooltip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000000;\n}\n.tooltip.top-left .tooltip-arrow {\n  bottom: 0;\n  right: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000000;\n}\n.tooltip.top-right .tooltip-arrow {\n  bottom: 0;\n  left: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000000;\n}\n.tooltip.right .tooltip-arrow {\n  top: 50%;\n  left: 0;\n  margin-top: -5px;\n  border-width: 5px 5px 5px 0;\n  border-right-color: #000000;\n}\n.tooltip.left .tooltip-arrow {\n  top: 50%;\n  right: 0;\n  margin-top: -5px;\n  border-width: 5px 0 5px 5px;\n  border-left-color: #000000;\n}\n.tooltip.bottom .tooltip-arrow {\n  top: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000000;\n}\n.tooltip.bottom-left .tooltip-arrow {\n  top: 0;\n  right: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000000;\n}\n.tooltip.bottom-right .tooltip-arrow {\n  top: 0;\n  left: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000000;\n}\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: none;\n  max-width: 276px;\n  padding: 1px;\n  font-family: \"Lato\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 15px;\n  background-color: #ffffff;\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n  border: 1px solid #cccccc;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 6px;\n  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n}\n.popover.top {\n  margin-top: -10px;\n}\n.popover.right {\n  margin-left: 10px;\n}\n.popover.bottom {\n  margin-top: 10px;\n}\n.popover.left {\n  margin-left: -10px;\n}\n.popover-title {\n  margin: 0;\n  padding: 8px 14px;\n  font-size: 15px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-radius: 5px 5px 0 0;\n}\n.popover-content {\n  padding: 9px 14px;\n}\n.popover > .arrow,\n.popover > .arrow:after {\n  position: absolute;\n  display: block;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.popover > .arrow {\n  border-width: 11px;\n}\n.popover > .arrow:after {\n  border-width: 10px;\n  content: \"\";\n}\n.popover.top > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-bottom-width: 0;\n  border-top-color: #999999;\n  border-top-color: rgba(0, 0, 0, 0.25);\n  bottom: -11px;\n}\n.popover.top > .arrow:after {\n  content: \" \";\n  bottom: 1px;\n  margin-left: -10px;\n  border-bottom-width: 0;\n  border-top-color: #ffffff;\n}\n.popover.right > .arrow {\n  top: 50%;\n  left: -11px;\n  margin-top: -11px;\n  border-left-width: 0;\n  border-right-color: #999999;\n  border-right-color: rgba(0, 0, 0, 0.25);\n}\n.popover.right > .arrow:after {\n  content: \" \";\n  left: 1px;\n  bottom: -10px;\n  border-left-width: 0;\n  border-right-color: #ffffff;\n}\n.popover.bottom > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-top-width: 0;\n  border-bottom-color: #999999;\n  border-bottom-color: rgba(0, 0, 0, 0.25);\n  top: -11px;\n}\n.popover.bottom > .arrow:after {\n  content: \" \";\n  top: 1px;\n  margin-left: -10px;\n  border-top-width: 0;\n  border-bottom-color: #ffffff;\n}\n.popover.left > .arrow {\n  top: 50%;\n  right: -11px;\n  margin-top: -11px;\n  border-right-width: 0;\n  border-left-color: #999999;\n  border-left-color: rgba(0, 0, 0, 0.25);\n}\n.popover.left > .arrow:after {\n  content: \" \";\n  right: 1px;\n  border-right-width: 0;\n  border-left-color: #ffffff;\n  bottom: -10px;\n}\n.carousel {\n  position: relative;\n}\n.carousel-inner {\n  position: relative;\n  overflow: hidden;\n  width: 100%;\n}\n.carousel-inner > .item {\n  display: none;\n  position: relative;\n  -webkit-transition: 0.6s ease-in-out left;\n  -o-transition: 0.6s ease-in-out left;\n  transition: 0.6s ease-in-out left;\n}\n.carousel-inner > .item > img,\n.carousel-inner > .item > a > img {\n  line-height: 1;\n}\n@media all and (transform-3d), (-webkit-transform-3d) {\n  .carousel-inner > .item {\n    -webkit-transition: -webkit-transform 0.6s ease-in-out;\n    -o-transition: -o-transform 0.6s ease-in-out;\n    transition: transform 0.6s ease-in-out;\n    -webkit-backface-visibility: hidden;\n    backface-visibility: hidden;\n    -webkit-perspective: 1000px;\n    perspective: 1000px;\n  }\n  .carousel-inner > .item.next,\n  .carousel-inner > .item.active.right {\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n    left: 0;\n  }\n  .carousel-inner > .item.prev,\n  .carousel-inner > .item.active.left {\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n    left: 0;\n  }\n  .carousel-inner > .item.next.left,\n  .carousel-inner > .item.prev.right,\n  .carousel-inner > .item.active {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n    left: 0;\n  }\n}\n.carousel-inner > .active,\n.carousel-inner > .next,\n.carousel-inner > .prev {\n  display: block;\n}\n.carousel-inner > .active {\n  left: 0;\n}\n.carousel-inner > .next,\n.carousel-inner > .prev {\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n.carousel-inner > .next {\n  left: 100%;\n}\n.carousel-inner > .prev {\n  left: -100%;\n}\n.carousel-inner > .next.left,\n.carousel-inner > .prev.right {\n  left: 0;\n}\n.carousel-inner > .active.left {\n  left: -100%;\n}\n.carousel-inner > .active.right {\n  left: 100%;\n}\n.carousel-control {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  width: 15%;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n  font-size: 20px;\n  color: #ffffff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  background-color: rgba(0, 0, 0, 0);\n}\n.carousel-control.left {\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0.5)), to(rgba(0, 0, 0, 0.0001)));\n  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-repeat: repeat-x;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1);\n}\n.carousel-control.right {\n  left: auto;\n  right: 0;\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0.0001)), to(rgba(0, 0, 0, 0.5)));\n  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-repeat: repeat-x;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1);\n}\n.carousel-control:hover,\n.carousel-control:focus {\n  outline: 0;\n  color: #ffffff;\n  text-decoration: none;\n  opacity: 0.9;\n  filter: alpha(opacity=90);\n}\n.carousel-control .icon-prev,\n.carousel-control .icon-next,\n.carousel-control .glyphicon-chevron-left,\n.carousel-control .glyphicon-chevron-right {\n  position: absolute;\n  top: 50%;\n  margin-top: -10px;\n  z-index: 5;\n  display: inline-block;\n}\n.carousel-control .icon-prev,\n.carousel-control .glyphicon-chevron-left {\n  left: 50%;\n  margin-left: -10px;\n}\n.carousel-control .icon-next,\n.carousel-control .glyphicon-chevron-right {\n  right: 50%;\n  margin-right: -10px;\n}\n.carousel-control .icon-prev,\n.carousel-control .icon-next {\n  width: 20px;\n  height: 20px;\n  line-height: 1;\n  font-family: serif;\n}\n.carousel-control .icon-prev:before {\n  content: '\\2039';\n}\n.carousel-control .icon-next:before {\n  content: '\\203A';\n}\n.carousel-indicators {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  z-index: 15;\n  width: 60%;\n  margin-left: -30%;\n  padding-left: 0;\n  list-style: none;\n  text-align: center;\n}\n.carousel-indicators li {\n  display: inline-block;\n  width: 10px;\n  height: 10px;\n  margin: 1px;\n  text-indent: -999px;\n  border: 1px solid #ffffff;\n  border-radius: 10px;\n  cursor: pointer;\n  background-color: #000 \\9;\n  background-color: rgba(0, 0, 0, 0);\n}\n.carousel-indicators .active {\n  margin: 0;\n  width: 12px;\n  height: 12px;\n  background-color: #ffffff;\n}\n.carousel-caption {\n  position: absolute;\n  left: 15%;\n  right: 15%;\n  bottom: 20px;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #ffffff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n}\n.carousel-caption .btn {\n  text-shadow: none;\n}\n@media screen and (min-width: 768px) {\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 30px;\n    height: 30px;\n    margin-top: -10px;\n    font-size: 30px;\n  }\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .icon-prev {\n    margin-left: -10px;\n  }\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-next {\n    margin-right: -10px;\n  }\n  .carousel-caption {\n    left: 20%;\n    right: 20%;\n    padding-bottom: 30px;\n  }\n  .carousel-indicators {\n    bottom: 20px;\n  }\n}\n.clearfix:before,\n.clearfix:after,\n.dl-horizontal dd:before,\n.dl-horizontal dd:after,\n.container:before,\n.container:after,\n.container-fluid:before,\n.container-fluid:after,\n.row:before,\n.row:after,\n.form-horizontal .form-group:before,\n.form-horizontal .form-group:after,\n.btn-toolbar:before,\n.btn-toolbar:after,\n.btn-group-vertical > .btn-group:before,\n.btn-group-vertical > .btn-group:after,\n.nav:before,\n.nav:after,\n.navbar:before,\n.navbar:after,\n.navbar-header:before,\n.navbar-header:after,\n.navbar-collapse:before,\n.navbar-collapse:after,\n.pager:before,\n.pager:after,\n.panel-body:before,\n.panel-body:after,\n.modal-header:before,\n.modal-header:after,\n.modal-footer:before,\n.modal-footer:after {\n  content: \" \";\n  display: table;\n}\n.clearfix:after,\n.dl-horizontal dd:after,\n.container:after,\n.container-fluid:after,\n.row:after,\n.form-horizontal .form-group:after,\n.btn-toolbar:after,\n.btn-group-vertical > .btn-group:after,\n.nav:after,\n.navbar:after,\n.navbar-header:after,\n.navbar-collapse:after,\n.pager:after,\n.panel-body:after,\n.modal-header:after,\n.modal-footer:after {\n  clear: both;\n}\n.center-block {\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n.pull-right {\n  float: right !important;\n}\n.pull-left {\n  float: left !important;\n}\n.hide {\n  display: none !important;\n}\n.show {\n  display: block !important;\n}\n.invisible {\n  visibility: hidden;\n}\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n.hidden {\n  display: none !important;\n}\n.affix {\n  position: fixed;\n}\n@-ms-viewport {\n  width: device-width;\n}\n.visible-xs,\n.visible-sm,\n.visible-md,\n.visible-lg {\n  display: none !important;\n}\n.visible-xs-block,\n.visible-xs-inline,\n.visible-xs-inline-block,\n.visible-sm-block,\n.visible-sm-inline,\n.visible-sm-inline-block,\n.visible-md-block,\n.visible-md-inline,\n.visible-md-inline-block,\n.visible-lg-block,\n.visible-lg-inline,\n.visible-lg-inline-block {\n  display: none !important;\n}\n@media (max-width: 767px) {\n  .visible-xs {\n    display: block !important;\n  }\n  table.visible-xs {\n    display: table !important;\n  }\n  tr.visible-xs {\n    display: table-row !important;\n  }\n  th.visible-xs,\n  td.visible-xs {\n    display: table-cell !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-block {\n    display: block !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-inline {\n    display: inline !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm {\n    display: block !important;\n  }\n  table.visible-sm {\n    display: table !important;\n  }\n  tr.visible-sm {\n    display: table-row !important;\n  }\n  th.visible-sm,\n  td.visible-sm {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-block {\n    display: block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md {\n    display: block !important;\n  }\n  table.visible-md {\n    display: table !important;\n  }\n  tr.visible-md {\n    display: table-row !important;\n  }\n  th.visible-md,\n  td.visible-md {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-block {\n    display: block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg {\n    display: block !important;\n  }\n  table.visible-lg {\n    display: table !important;\n  }\n  tr.visible-lg {\n    display: table-row !important;\n  }\n  th.visible-lg,\n  td.visible-lg {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-block {\n    display: block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (max-width: 767px) {\n  .hidden-xs {\n    display: none !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .hidden-sm {\n    display: none !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .hidden-md {\n    display: none !important;\n  }\n}\n@media (min-width: 1200px) {\n  .hidden-lg {\n    display: none !important;\n  }\n}\n.visible-print {\n  display: none !important;\n}\n@media print {\n  .visible-print {\n    display: block !important;\n  }\n  table.visible-print {\n    display: table !important;\n  }\n  tr.visible-print {\n    display: table-row !important;\n  }\n  th.visible-print,\n  td.visible-print {\n    display: table-cell !important;\n  }\n}\n.visible-print-block {\n  display: none !important;\n}\n@media print {\n  .visible-print-block {\n    display: block !important;\n  }\n}\n.visible-print-inline {\n  display: none !important;\n}\n@media print {\n  .visible-print-inline {\n    display: inline !important;\n  }\n}\n.visible-print-inline-block {\n  display: none !important;\n}\n@media print {\n  .visible-print-inline-block {\n    display: inline-block !important;\n  }\n}\n@media print {\n  .hidden-print {\n    display: none !important;\n  }\n}\n.navbar {\n  border-width: 0;\n}\n.navbar-default .badge {\n  background-color: #fff;\n  color: #2c3e50;\n}\n.navbar-inverse .badge {\n  background-color: #fff;\n  color: #18bc9c;\n}\n.navbar-brand {\n  line-height: 1;\n}\n.btn {\n  border-width: 2px;\n}\n.btn:active {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.btn-group.open .dropdown-toggle {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.text-primary,\n.text-primary:hover {\n  color: #2c3e50;\n}\n.text-success,\n.text-success:hover {\n  color: #18bc9c;\n}\n.text-danger,\n.text-danger:hover {\n  color: #e74c3c;\n}\n.text-warning,\n.text-warning:hover {\n  color: #f39c12;\n}\n.text-info,\n.text-info:hover {\n  color: #3498db;\n}\ntable a:not(.btn),\n.table a:not(.btn) {\n  text-decoration: underline;\n}\ntable .dropdown-menu a,\n.table .dropdown-menu a {\n  text-decoration: none;\n}\ntable .success,\n.table .success,\ntable .warning,\n.table .warning,\ntable .danger,\n.table .danger,\ntable .info,\n.table .info {\n  color: #fff;\n}\ntable .success > th > a,\n.table .success > th > a,\ntable .warning > th > a,\n.table .warning > th > a,\ntable .danger > th > a,\n.table .danger > th > a,\ntable .info > th > a,\n.table .info > th > a,\ntable .success > td > a,\n.table .success > td > a,\ntable .warning > td > a,\n.table .warning > td > a,\ntable .danger > td > a,\n.table .danger > td > a,\ntable .info > td > a,\n.table .info > td > a,\ntable .success > a,\n.table .success > a,\ntable .warning > a,\n.table .warning > a,\ntable .danger > a,\n.table .danger > a,\ntable .info > a,\n.table .info > a {\n  color: #fff;\n}\ntable > thead > tr > th,\n.table > thead > tr > th,\ntable > tbody > tr > th,\n.table > tbody > tr > th,\ntable > tfoot > tr > th,\n.table > tfoot > tr > th,\ntable > thead > tr > td,\n.table > thead > tr > td,\ntable > tbody > tr > td,\n.table > tbody > tr > td,\ntable > tfoot > tr > td,\n.table > tfoot > tr > td {\n  border: none;\n}\ntable-bordered > thead > tr > th,\n.table-bordered > thead > tr > th,\ntable-bordered > tbody > tr > th,\n.table-bordered > tbody > tr > th,\ntable-bordered > tfoot > tr > th,\n.table-bordered > tfoot > tr > th,\ntable-bordered > thead > tr > td,\n.table-bordered > thead > tr > td,\ntable-bordered > tbody > tr > td,\n.table-bordered > tbody > tr > td,\ntable-bordered > tfoot > tr > td,\n.table-bordered > tfoot > tr > td {\n  border: 1px solid #ecf0f1;\n}\n.form-control,\ninput {\n  border-width: 2px;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.form-control:focus,\ninput:focus {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.has-warning .help-block,\n.has-warning .control-label,\n.has-warning .radio,\n.has-warning .checkbox,\n.has-warning .radio-inline,\n.has-warning .checkbox-inline,\n.has-warning.radio label,\n.has-warning.checkbox label,\n.has-warning.radio-inline label,\n.has-warning.checkbox-inline label,\n.has-warning .form-control-feedback {\n  color: #f39c12;\n}\n.has-warning .form-control,\n.has-warning .form-control:focus {\n  border: 2px solid #f39c12;\n}\n.has-warning .input-group-addon {\n  border-color: #f39c12;\n}\n.has-error .help-block,\n.has-error .control-label,\n.has-error .radio,\n.has-error .checkbox,\n.has-error .radio-inline,\n.has-error .checkbox-inline,\n.has-error.radio label,\n.has-error.checkbox label,\n.has-error.radio-inline label,\n.has-error.checkbox-inline label,\n.has-error .form-control-feedback {\n  color: #e74c3c;\n}\n.has-error .form-control,\n.has-error .form-control:focus {\n  border: 2px solid #e74c3c;\n}\n.has-error .input-group-addon {\n  border-color: #e74c3c;\n}\n.has-success .help-block,\n.has-success .control-label,\n.has-success .radio,\n.has-success .checkbox,\n.has-success .radio-inline,\n.has-success .checkbox-inline,\n.has-success.radio label,\n.has-success.checkbox label,\n.has-success.radio-inline label,\n.has-success.checkbox-inline label,\n.has-success .form-control-feedback {\n  color: #18bc9c;\n}\n.has-success .form-control,\n.has-success .form-control:focus {\n  border: 2px solid #18bc9c;\n}\n.has-success .input-group-addon {\n  border-color: #18bc9c;\n}\n.nav .open > a,\n.nav .open > a:hover,\n.nav .open > a:focus {\n  border-color: transparent;\n}\n.pager a,\n.pager a:hover {\n  color: #fff;\n}\n.pager .disabled > a,\n.pager .disabled > a:hover,\n.pager .disabled > a:focus,\n.pager .disabled > span {\n  background-color: #3be6c4;\n}\n.close {\n  color: #fff;\n  text-decoration: none;\n  opacity: 0.4;\n}\n.close:hover,\n.close:focus {\n  color: #fff;\n  opacity: 1;\n}\n.alert .alert-link {\n  color: #fff;\n  text-decoration: underline;\n}\n.progress {\n  height: 10px;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.progress .progress-bar {\n  font-size: 10px;\n  line-height: 10px;\n}\n.well {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\na.list-group-item.active,\na.list-group-item.active:hover,\na.list-group-item.active:focus {\n  border-color: #ecf0f1;\n}\na.list-group-item-success.active {\n  background-color: #18bc9c;\n}\na.list-group-item-success.active:hover,\na.list-group-item-success.active:focus {\n  background-color: #15a589;\n}\na.list-group-item-warning.active {\n  background-color: #f39c12;\n}\na.list-group-item-warning.active:hover,\na.list-group-item-warning.active:focus {\n  background-color: #e08e0b;\n}\na.list-group-item-danger.active {\n  background-color: #e74c3c;\n}\na.list-group-item-danger.active:hover,\na.list-group-item-danger.active:focus {\n  background-color: #e43725;\n}\n.panel-default .close {\n  color: #2c3e50;\n}\n.modal .close {\n  color: #2c3e50;\n}\n.popover {\n  color: #2c3e50;\n}\n", ""]);

	// exports


/***/ },
/* 14 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "f4769f9bdb7466be65088239c12046d1.eot";

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "448c34a56d699c29117adc64c43affeb.woff2";

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fa2772327f55d8198301fdb8bcfc8158.woff";

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "e18bbf611f2a2e43afc071aa2f4e1512.ttf";

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "89889688147bd7575d6327160d64e760.svg";

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(9);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TracingSwitch = function (_React$Component) {
	  _inherits(TracingSwitch, _React$Component);

	  function TracingSwitch(props) {
	    _classCallCheck(this, TracingSwitch);

	    var _this = _possibleConstructorReturn(this, (TracingSwitch.__proto__ || Object.getPrototypeOf(TracingSwitch)).call(this, props));

	    _this.state = { tracing: false };
	    return _this;
	  }

	  _createClass(TracingSwitch, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000);
	    }
	  }, {
	    key: 'componentDidUnmount',
	    value: function componentDidUnmount() {
	      window.clearTimeout(this.state.timeout);
	    }
	  }, {
	    key: 'handleClick',
	    value: function handleClick(event) {
	      var spec = this.state.tracing ? "pause" : "all";

	      $.ajax({
	        url: "/api/trace_set",
	        data: { spec: spec }
	      }).error(function (jqXHR, errorcode) {
	        return console.error("Cant set tracing", errorcode);
	      }).always(function () {
	        clearTimeout(this.state.timeout);
	        this.getTracingStatus();
	      }.bind(this));
	    }
	  }, {
	    key: 'getTracingStatus',
	    value: function getTracingStatus() {
	      $.ajax({ url: "/api/trace_status" }).done(function (data) {
	        this.state.tracing = data.tracing;
	        this.state.timeout = window.setTimeout(this.getTracingStatus.bind(this), 1000);
	        this.setState(this.state);
	      }.bind(this));
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var symbol = "glyphicon glyphicon-" + (this.state.tracing ? "pause" : "record");
	      var btnColor = "btn btn-" + (this.state.tracing ? "danger" : "success");
	      var text = this.state.tracing ? "Pause tracing" : "Trace all";

	      return _react2.default.createElement(
	        'form',
	        { className: 'navbar-form navbar-left', role: 'search' },
	        _react2.default.createElement(
	          'button',
	          { type: 'button', onClick: this.handleClick.bind(this), className: btnColor },
	          _react2.default.createElement('span', { className: symbol, 'aria-hidden': 'true' }),
	          ' ',
	          text
	        )
	      );
	    }
	  }]);

	  return TracingSwitch;
	}(_react2.default.Component);

	exports.default = TracingSwitch;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _graph = __webpack_require__(8);

	var _graph2 = _interopRequireDefault(_graph);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var GraphPanel = function (_React$Component) {
	  _inherits(GraphPanel, _React$Component);

	  function GraphPanel(props) {
	    _classCallCheck(this, GraphPanel);

	    var _this = _possibleConstructorReturn(this, (GraphPanel.__proto__ || Object.getPrototypeOf(GraphPanel)).call(this, props));

	    _this.state = { funs: [] };
	    return _this;
	  }

	  _createClass(GraphPanel, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.funsInterval = window.setTimeout(this.getFunsList.bind(this), 500);
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      window.clearTimeout(this.interval);
	    }

	    // Getting data

	  }, {
	    key: 'startMonitoring',
	    value: function startMonitoring(query) {
	      $.ajax({
	        url: "/api/mon_start",
	        data: { query: query }
	      }).success(function () {
	        this.props.clearFunctionBrowser();
	        this.getFunsList();
	      }.bind(this));
	    }
	  }, {
	    key: 'addGraph',
	    value: function addGraph(query) {
	      this.startMonitoring(query);
	    }
	  }, {
	    key: 'removeGraph',
	    value: function removeGraph(fun) {
	      var newState = this.state;
	      var index = this.state.funs.indexOf(fun);
	      if (index > -1) {
	        newState.funs.splice(index, 1);
	      }
	      this.setState(newState);
	    }
	  }, {
	    key: 'getFunsList',
	    value: function getFunsList() {
	      $.ajax({
	        url: "/api/mon_get_all",
	        success: this.handleFuns.bind(this),
	        error: this.handleFunsError.bind(this)
	      });
	    }
	  }, {
	    key: 'handleFuns',
	    value: function handleFuns(data) {
	      this.state.funs = data;
	      this.setState(this.state);
	      window.setTimeout(this.getFunsList.bind(this), 500);
	    }
	  }, {
	    key: 'handleFunsError',
	    value: function handleFunsError(jqXHR, error) {
	      console.error("Getting funs error: ", error);
	      window.setTimeout(this.getFunsList.bind(this), 1000);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var funs = this.state.funs;

	      var graphsPanels = [];
	      for (var i = 0; i < funs.length; i++) {
	        graphsPanels.push(_react2.default.createElement(
	          'div',
	          { key: funs[i], className: 'row' },
	          _react2.default.createElement(
	            'div',
	            { className: 'col-md-12' },
	            _react2.default.createElement(_graph2.default, { removeGraph: this.removeGraph.bind(this), fun: funs[i] })
	          )
	        ));
	      }

	      return _react2.default.createElement(
	        'div',
	        { className: 'container-fluid' },
	        graphsPanels
	      );
	    }
	  }]);

	  return GraphPanel;
	}(_react2.default.Component);

	exports.default = GraphPanel;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(9);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ACModal = function (_React$Component) {
	  _inherits(ACModal, _React$Component);

	  function ACModal(props) {
	    _classCallCheck(this, ACModal);

	    var _this = _possibleConstructorReturn(this, (ACModal.__proto__ || Object.getPrototypeOf(ACModal)).call(this, props));

	    _this.state = {
	      funs: [],
	      position: -1
	    };
	    _this.cleared = false;
	    return _this;
	  }

	  _createClass(ACModal, [{
	    key: 'componentDidUpdate',
	    value: function componentDidUpdate() {
	      /* check if we need to scroll up because list of funs was reloaded */
	      if (this.cleared) {
	        var node = _react2.default.findDOMNode(this.refs.suggestionsPanel);
	        if (node) {
	          node.scrollTop = 0;
	          this.cleared = false;
	        }
	      }
	    }
	  }, {
	    key: 'displayFuns',
	    value: function displayFuns(data) {
	      if (data.length == 0) {
	        this.cleared = true;
	      }
	      this.state.funs = data;
	      this.state.position = -1;
	      this.setState(this.state);
	    }
	  }, {
	    key: 'handleFunClick',
	    value: function handleFunClick(fun, e) {
	      var query = ACModal.formatFun(fun);
	      this.props.addGraph(query);
	    }
	  }, {
	    key: 'moveHighlight',
	    value: function moveHighlight(delta) {
	      var targetPosition = this.state.position + delta;

	      if (targetPosition > 0 || targetPosition < this.state.funs.length) {
	        this.state.position = targetPosition;
	        this.setState(this.state);
	      }
	    }
	  }, {
	    key: 'highlightedFun',
	    value: function highlightedFun() {
	      var fun = null;
	      var pos = this.state.position;

	      if (pos != -1) {
	        fun = this.state.funs[pos];
	      }

	      return fun;
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var funs = this.state.funs;
	      var rows = [];
	      var highlightClass = "";
	      var width, height;

	      for (var i = 0; i < funs.length && i < 100; i++) {

	        if (i == this.state.position) highlightClass = "row-highlight";else highlightClass = "";

	        rows.push(_react2.default.createElement(
	          'tr',
	          { className: highlightClass, key: funs[i],
	            onClick: this.handleFunClick.bind(this, funs[i]) },
	          _react2.default.createElement(
	            'td',
	            null,
	            ACModal.formatFun(funs[i])
	          )
	        ));
	      }

	      width = $("#searchBox").css("width");
	      height = $("#searchBox").css("height");

	      if (funs.length > 0) {
	        return _react2.default.createElement(
	          'div',
	          { ref: 'suggestionsPanel', className: 'panel panel-default suggestions-panel',
	            style: { top: height, width: width } },
	          _react2.default.createElement(
	            'table',
	            { className: 'table table-striped' },
	            _react2.default.createElement(
	              'tbody',
	              null,
	              rows
	            )
	          )
	        );
	      } else return _react2.default.createElement('div', null);
	    }
	  }], [{
	    key: 'formatFun',
	    value: function formatFun(fun) {
	      return fun[0] + ':' + fun[1] + '/' + fun[2];
	    }
	  }]);

	  return ACModal;
	}(_react2.default.Component);

	var FunctionBrowser = function (_React$Component2) {
	  _inherits(FunctionBrowser, _React$Component2);

	  function FunctionBrowser(props) {
	    _classCallCheck(this, FunctionBrowser);

	    var _this2 = _possibleConstructorReturn(this, (FunctionBrowser.__proto__ || Object.getPrototypeOf(FunctionBrowser)).call(this, props));

	    _this2.state = { value: "" };
	    return _this2;
	  }

	  _createClass(FunctionBrowser, [{
	    key: 'checkInput',
	    value: function checkInput(input) {
	      /* for now this is mostly just a placeholder to check function browser input
	         whether it is suitable to add a graph */
	      if (input) return input;else return null;
	    }
	  }, {
	    key: 'handleKeyDown',
	    value: function handleKeyDown(e) {
	      var mod = null,
	          fun = null,
	          arity = null;
	      var enteredQuery;

	      switch (e.keyCode) {
	        case 27:
	          /* ESC */
	          /* erase everything */
	          this.clear();
	          break;
	        case 13:
	          /* RETURN */
	          /* submit function or try to complete using selected fun */
	          e.preventDefault();

	          enteredQuery = this.checkInput(e.target.value);
	          if (enteredQuery) this.props.addGraph(enteredQuery);else this.completeSearch();
	          break;
	        case 9:
	          /* TAB */
	          /* try to complete using selected suggestion*/
	          e.preventDefault();
	          this.completeSearch();
	          break;
	        case 38:
	          /* ARROW UP */
	          /* select next fun from the list */
	          this.refs.acm.moveHighlight(-1);
	          break;
	        case 40:
	          /* ARROW DOWN */
	          /* select previous fun from the list */
	          this.refs.acm.moveHighlight(1);
	          break;
	      }
	    }
	  }, {
	    key: 'handleChange',
	    value: function handleChange(event) {
	      this.setState({ value: event.target.value });
	      if (event.target.value != "") {
	        $.getJSON("/api/funs", { query: event.target.value }, this.funsSuccess.bind(this));
	      } else {
	        this.refs.acm.displayFuns([]);
	      }
	    }
	  }, {
	    key: 'getSearchBox',
	    value: function getSearchBox() {
	      return _react2.default.findDOMNode(this.refs.searchBox);
	    }
	  }, {
	    key: 'completeSearch',
	    value: function completeSearch() {
	      var highlightedFun = this.refs.acm.highlightedFun();
	      var funStr;

	      if (highlightedFun) {
	        funStr = ACModal.formatFun(highlightedFun);
	        $(this.getSearchBox()).val(funStr);
	        this.refs.acm.displayFuns([]);
	      }
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.getSearchBox().value = "";
	      this.refs.acm.displayFuns([]);
	    }
	  }, {
	    key: 'funsSuccess',
	    value: function funsSuccess(data) {
	      if (this.state.value != "") this.refs.acm.displayFuns(data);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var autocomp = null;
	      var value = this.state.value;

	      return _react2.default.createElement(
	        'form',
	        { className: 'navbar-form' },
	        _react2.default.createElement(
	          'div',
	          { className: 'form-group', style: { display: "inline" } },
	          _react2.default.createElement(
	            'div',
	            { className: 'input-group', style: { display: "table" } },
	            _react2.default.createElement(
	              'span',
	              { className: 'input-group-addon', style: { width: "1%" } },
	              _react2.default.createElement('span', { className: 'glyphicon glyphicon-search' })
	            ),
	            _react2.default.createElement('input', { id: 'searchBox', ref: 'searchBox', type: 'text', className: 'form-control',
	              placeholder: 'Function', 'aria-describedby': 'sizing-addon3',
	              value: value, onKeyDown: this.handleKeyDown.bind(this),
	              onChange: this.handleChange.bind(this), autofocus: 'autofocus' }),
	            _react2.default.createElement(ACModal, { ref: 'acm', addGraph: this.props.addGraph })
	          )
	        )
	      );
	    }
	  }]);

	  return FunctionBrowser;
	}(_react2.default.Component);

	exports.default = FunctionBrowser;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }
]);