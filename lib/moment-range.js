(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('moment'));
  } else if (typeof define === 'function' && define.amd) {
    define('moment-range', ['moment'], factory);
  } else {
    root.moment = factory(root.moment);
  }
}(this, function(moment) {

  var DateRange, INTERVALS;

  INTERVALS = {
    year: true,
    month: true,
    week: true,
    day: true,
    hour: true,
    minute: true,
    second: true
  };

  /**
   * DateRange class to store ranges and query dates.
   * @typedef {!Object}
   *
   */


  DateRange = (function() {

    // Default increment/decrement at bounds

    var deltaQuantity = 1;
    var deltaUnits = 's';

    /**
     * DateRange instance.
     * @param {(Moment|Date)} start Start of interval.
     * @param {(Moment|Date)} end   End of interval.
     * @constructor
     *
     */


    function DateRange(start, end) {
      if (Array.isArray(start)) {
        this.ranges = start;
        this.mode = 1; // 1 = "array/set mode"; undefined = "normal mode"
      } else {
        this.start = moment(start);
        this.end = moment(end);
      }
    }

    /**
     * Determine if the current interval contains a given moment/date/range.
     * @param {(Moment|Date|DateRange)} other Date to check.
     * @return {!boolean}
     *
     */


    DateRange.prototype.contains = function(other) {
      if (other instanceof DateRange) {
        if (this.mode === 1) {
          return this.ranges.length > 0 ? this.ranges[0].start <= other.start &&
            this.ranges[this.ranges.length - 1].end >= other.end : false;
        } else {
          return this.start <= other.start && this.end >= other.end;
        }
      } else {
        return (this.start <= other && other <= this.end);
      }
    };

    /**
     * @private
     *
     */


    DateRange.prototype._by_string = function(interval, hollaback) {
      var current, _results;
      current = moment(this.start);
      _results = [];
      while (this.contains(current)) {
        hollaback.call(this, current.clone());
        _results.push(current.add(interval, 1));
      }
      return _results;
    };

    /**
     * @private
     *
     */


    DateRange.prototype._by_range = function(range_interval, hollaback) {
      var i, l, _i, _results;
      l = Math.round(this / range_interval);
      if (l === Infinity) {
        return this;
      }
      _results = [];
      for (i = _i = 0; 0 <= l ? _i <= l : _i >= l; i = 0 <= l ? ++_i : --_i) {
        _results.push(hollaback.call(this, moment(this.start.valueOf() + range_interval.valueOf() * i)));
      }
      return _results;
    };

    /**
     * Determine if the current date range overlaps a given date range.
     * @param {!DateRange} range Date range to check.
     * @return {!boolean}
     *
     */


    DateRange.prototype.overlaps = function(range) {
      if (this.mode === 1) {
        for (var i = 0; i < this.ranges.length; i++) {
          if (this.ranges[i].overlaps(range)) {
            return true;
          }
        }
        return false;
      } else {
        return this.intersect(range) !== null;
      }
    };

    /**
     * Determine the intersecting periods from one or more date ranges.
     * @param {!DateRange} other A date range to intersect with this one.
     * @return {!DateRange|null}
     *
     */


    DateRange.prototype.intersect = function(other) {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (((this.start <= (_ref1 = other.start) && _ref1 <= (_ref = this.end)) && _ref < other.end)) {
        return new DateRange(other.start, this.end);
      } else if (((other.start < (_ref3 = this.start) && _ref3 <= (_ref2 = other.end)) && _ref2 <= this.end)) {
        return new DateRange(this.start, other.end);
      } else if (((other.start < (_ref5 = this.start) && _ref5 <= (_ref4 = this.end)) && _ref4 < other.end)) {
        return this;
      } else if (((this.start <= (_ref7 = other.start) && _ref7 <= (_ref6 = other.end)) && _ref6 <= this.end)) {
        return other;
      } else {
        return null;
      }
    };

    /**
     * Subtract one range from another.
     * @param {!DateRange} other A date range to substract from this one.
     * @return {!DateRange[]}
     *
     */

    DateRange.prototype.subtract = function(other, time, units) {

      var _ref, _ref2 = this.ranges;

      if (this.mode === 1) {

        // additional optimizaitons can be done
        // i.e. checking if bounds are exceeded
        // before entering for loop

        for (var i = 0; i < _ref2.length; i++) {
          if (_ref2[i].intersect(other) === null) {
            continue;
          }
          _ref = _ref2[i].subtract(other, time, units);
          if (_ref.ranges.length === 0) {
            _ref2.splice(i--, 1);
          } else {

            _ref.forEach(function(r, g) {
              if (g === 0) {
                _ref2[i++] = r;
              } else {
                _ref2.splice(i++, 0, r);
              }
            });
            i--;
          }
        }

        return new DateRange(this.ranges);
      } else {
        var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        if (this.intersect(other) === null) {
          return new DateRange([new DateRange(this.start, this.end)]);
        } else if (((other.start <= (_ref1 = this.start) && _ref1 <= (_ref = this.end)) && _ref <= other.end)) {
          return new DateRange([]);
        } else if (((other.start <= (_ref3 = this.start) && _ref3 <= (_ref2 = other.end)) && _ref2 < this.end)) {
          return new DateRange([new DateRange(other.end.add(deltaQuantity || time, deltaUnits || units), this.end)]);
        } else if (((this.start < (_ref5 = other.start) && _ref5 <= (_ref4 = this.end)) && _ref4 <= other.end)) {
          return new DateRange([new DateRange(this.start, other.start.subtract(deltaQuantity || time, deltaUnits || units))]);
        } else if (((this.start < (_ref7 = other.start) && _ref7 <= (_ref6 = other.end)) && _ref6 < this.end)) {
          return new DateRange([new DateRange(this.start, other.start.subtract(deltaQuantity || time, deltaUnits || units)), new DateRange(other.end.add(deltaQuantity, deltaUnits), this.end)]);
        }
      }
    };

    DateRange.prototype.forEach = function(callback) {
      this.toList().forEach(callback);
    };

    DateRange.prototype.toList = function() {
      if (this.mode === 1) {
        return this.ranges;
      } else {
        return [this];
      }
    };

    /**
     * Add one range from another.
     * @param {!DateRange} other A date range to add from this one.
     * @return {!DateRange[]}
     *
     */

    DateRange.prototype.add = function(other) {
      // Note: The DateRanges in the array MUST NOT intersect and should remain sorted!
      // This will happen automatically if processed through moment-range
      if (this.mode === 1) {
        var i, x;
        var _ranges = this.ranges;
        if (_ranges.length === 0) {
          return new DateRange([new DateRange(other.start, other.end)]);
        } else if (other.start <= _ranges[0].start && _ranges[_ranges.length - 1].end <= other.end) { // other is bigger
          return new DateRange([new DateRange(other.start, other.end)]);
        } else if (_ranges[_ranges.length - 1].end < other.start) {
          _ranges.push(new DateRange(other.start, other.end));
          return new DateRange(_ranges);
        } else if (_ranges[0].start > other.end) {
          _ranges.unshift(new DateRange(other.start, other.end));
          return new DateRange(_ranges);
        } else if (_ranges[0].start >= other.start && other.end <= _ranges[_ranges.length - 1].end) { // find the end
          for (i = 0; i < _ranges.length; i++) {
            if (_ranges[i].start <= other.end && other.end <= _ranges[i].end) {
              _ranges.splice(0, _ranges.length - i, new DateRange(other.start, _ranges[i].end));
              return new DateRange(_ranges);
            } else if (_ranges[i].start > other.end) {
              _ranges.splice(0, _ranges.length - i, new DateRange(other.start, other.end));
              return new DateRange(_ranges);
            }
          }
        } else if (_ranges[0].start <= other.start && other.end >= _ranges[_ranges.length - 1].end) { // find the start
          for (i = 0; i < _ranges.length; i++) {
            if (_ranges[i].start <= other.start && other.start <= _ranges[i].end) {
              _ranges.splice(i, _ranges.length - i, new DateRange(_ranges[i].start, other.end));
              return new DateRange(_ranges);
            } else if (_ranges[i].start > other.start) {
              _ranges.splice(i, _ranges.length - i, new DateRange(other.start, other.end));
              return new DateRange(_ranges);
            }
          }
        } else if (_ranges[0].start <= other.start && other.end <= _ranges[_ranges.length - 1].end) {
          for (i = 0; i < _ranges.length; i++) {
            if (_ranges[i].start <= other.start && _ranges[i].end >= other.start) { // include the start
              for (x = i; x < _ranges.length; x++) {
                if (_ranges[x].start <= other.end && _ranges[x].end >= other.end) {
                  _ranges.splice(i, x - i + 1, new DateRange(_ranges[i].start, _ranges[x].end)); // include current one
                  return new DateRange(_ranges);
                } else if (_ranges[x].start > other.end) {
                  _ranges.splice(i, x - i, new DateRange(_ranges[i].start, other.end)); // don't include current one
                  return new DateRange(_ranges);
                }
              }
            } else if (_ranges[i].start > other.start) { // don't inclue the start
              for (x = i; x < _ranges.length; x++) {
                if (_ranges[x].start <= other.end && _ranges[x].end >= other.end) {
                  _ranges.splice(i, x - i + 1, new DateRange(other.start, _ranges[x].end)); // include current one
                  return new DateRange(_ranges);
                } else if (_ranges[x].start > other.end) {
                  _ranges.splice(i, x - i - 1, new DateRange(other.start, other.end)); // don't include current one
                  return new DateRange(_ranges);
                }
              }
            }
          }
        } else {
          throw Error("Unexpected error - Broken contract");
        }
      } else {
        var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        if (this.intersect(other) === null) {
          return other.start < this.start ?
            new DateRange([new DateRange(other.start, other.end), new DateRange(this.start, this.end)]) :
            new DateRange([new DateRange(this.start, this.end), new DateRange(other.start, other.end)]);
        } else if (((other.start <= (_ref1 = this.start) && _ref1 < (_ref = this.end)) && _ref <= other.end)) {
          return new DateRange([new DateRange(other.start, other.end)]);
        } else if (((other.start <= (_ref3 = this.start) && _ref3 < (_ref2 = other.end)) && _ref2 < this.end)) {
          return new DateRange([new DateRange(other.start, this.end)]);
        } else if (((this.start < (_ref5 = other.start) && _ref5 < (_ref4 = this.end)) && _ref4 <= other.end)) {
          return new DateRange([new DateRange(this.start, other.end)]);
        } else if (((this.start < (_ref7 = other.start) && _ref7 < (_ref6 = other.end)) && _ref6 < this.end)) {
          return new DateRange([new DateRange(this.start, this.start)]);
        }
      }
    };

    /**
     * Iterate over the date range by a given date range, executing a function
     * for each sub-range.
     * @param {!DateRange|String} range     Date range to be used for iteration
     *                                      or shorthand string (shorthands:
     *                                      http://momentjs.com/docs/#/manipulating/add/)
     * @param {!function(Moment)} hollaback Function to execute for each sub-range.
     * @return {!boolean}
     *
     */


    DateRange.prototype.by = function(range, hollaback) {
      if (this.mode === 1) {
        this.ranges.forEach(function(rng) {
          rng.by(range, hollaback);
        });
      } else {
        if (typeof range === 'string') {
          this._by_string(range, hollaback);
        } else {
          this._by_range(range, hollaback);
        }
      }
      return this;
    };

    /**
     * Date range in milliseconds. Allows basic coercion math of date ranges.
     * @return {!number}
     *
     */


    DateRange.prototype.valueOf = function() {
      if (this.mode === 1) {
        if (this.ranges.length === 0) {
          return 0;
        }
        return this.ranges[this.ranges.length - 1].end - this.ranges[0].start;
      }
      return this.end - this.start;
    };

    /**
     * Date range toDate
     * @return  {!Array}
     *
     */


    DateRange.prototype.toDate = function() {
      if (this.mode === 1) {
        var m = [];
        this.ranges.forEach(function(a) {
          m.push(a.start.toDate());
          m.push(a.end.toDate());
        });
        return m;
      } else {
        return [this.start.toDate(), this.end.toDate()];
      }
    };


    DateRange.prototype.toString = function() {
      if (this.mode === 1) {
        var m = [];
        this.ranges.forEach(function(a) {
          m.push({
            'start': a.start.format(),
            'end': a.end.format()
          });
        });
        return m;
      } else {
        return [this.start.format(), this.end.format()];
      }
    };

    /**
     * Determine if this date range is the same as another.
     * @param {!DateRange} other Another date range to compare to.
     * @return {!boolean}
     *
     */


    DateRange.prototype.isSame = function(other) {
      if (this.mode === 1) {
        for (var i = 0; i < this.ranges.length; i++) {
          if (!this.ranges[i].isSame(other)) {
            return false;
          }
        }
        return true;
      } else {
        return this.start.isSame(other.start) && this.end.isSame(other.end);
      }
    };

    /**
     * Return the difference of the end vs start.
     *   - To get the difference in milliseconds, use range#diff
     *   - To get the difference in another unit of measurement, pass that measurement as the second argument.
     * @return milliseconds if no measure is passed in, otherwise an increment of measure
     *
     */


    DateRange.prototype.diff = function(unit) {
      if (this.mode === 1) {
        throw Error("Unable to perform diff in array mode.");
      }
      if (unit === null) {
        unit = void 0;
      }
      return this.end.diff(this.start, unit);
    };

    return DateRange;

  })();

  /**
   * Build a date range.
   * @param {(Moment|Date)} start Start of range.
   * @param {(Moment|Date)} end   End of range.
   * @this {Moment}
   * @return {!DateRange}
   *
   */


  moment.fn.range = function(start, end) {
    if (start in INTERVALS) {
      return new DateRange(moment(this).startOf(start), moment(this).endOf(start));
    } else {
      return new DateRange(start, end);
    }
  };

  /**
   * Build a date range.
   * @param {String} selector.
   * @this {Moment}
   * @return {!DateRange}
   *
   */


  moment.range = function(start, end) {

    if (typeof start !== 'string' && arguments.length >= 2) {
      return new DateRange(start, end);
    }

    var sel = start;
    var data = [];
    var period = sel.replace(/\s{2,}/g, " ").split(/\((.*?)\)/g);

    for (var i = 0; i < period.length; i++) {
      var inset = [];
      var not = period[i].match(/^\s*?\^/g) ? true : false;
      period[i] = period[i].replace(/^\s*?\^/g, "").trim().split(">>");
      for (var x = 0; x < period[i].length; x++) {
        var d = Date.parse(period[i][x]);
        if (!isNaN(d)) {
          if (!isNaN(Number(period[i][x])) && period[i][x].length === 4) {
                        var m = moment(period[i][x], 'YYYY');
                        inset.push(m);
                        inset.push(moment(m).add(1, 'year').subtract(1, 's'));
          } else {
            inset.push(moment(d));
          }
        }
      }

      if (inset.length > 0) {

        var valid = true;

        if (inset.length > 1) {
          for (var g = 0; g < inset.length - 1; g++) {
            if (inset[g] > inset[g + 1]) {
              valid = false;
              break;
            }
          }
        }

        if (valid) {
          data.push({
            exclude: not,
            range: inset.length > 2 ? [inset[0], inset[inset.length - 1]] : inset
          });
        }
      }
    }

    var range = false;

    for (i = 0; i < data.length; i++) {
      var rng = moment().range(data[i].range[0], data[i].range[1] || data[i].range[0]);
      range = range ? range[data[i].exclude ? 'subtract' : 'add'](rng) : rng;
    }

    if (!range) {
      throw Error('No positive range');
    }

    range.__selector__ = data;

    return range;

  };

  /**
   * Check if the current moment is within a given date range.
   * @param {!DateRange} range Date range to check.
   * @this {Moment}
   * @return {!boolean}
   *
   */


  moment.fn.within = function(range) {
    return range.contains(this._d);
  };

  return moment;
}));
