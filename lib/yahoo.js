/**
 * Module dependencies.
 */

var request = require("request"),
    cheerio = require("cheerio"),
    omotenashi = require("omotenashi-js"),
    csv = omotenashi.csv,
    st = omotenashi.stats,
    ts = omotenashi.ts,
    nm = omotenashi.num;

module.exports = {
  retryable: 5,

  getSymbolCandidates: function (base) {
    // refer to https://www.nasdaqtrader.com/Trader.aspx?id=CQSSymbolConvention
    return [
      base,
      base.replace("^", "-P"),
      base.replace("/", "-"),
      base.replace("/WS", "-WT"),
      base.replace(/CL[0-9]/, ""),
      base.replace("$", "-WI"),
      base.replace("^", "-P").replace(/CL[0-9]/, ""),
      base.replace("/", "-").replace(/CL[0-9]/, ""),
      base.replace("/WS", "-WT").replace(/CL[0-9]/, "")
    ].filter(function (v, i, a) {
      if (a.indexOf(v) === i) return true;
    });
  },

  /**
   * get valid symbols which can be used in yahoo.
   *
   * @param {Array} symbols is array including symbol string candidates.
   * @param {Function} next is callback function.
   * @param {Object} state is inner parameter for recursive call,
   *   which is {valid: "valid symbol name that have found", symbolno: "counter for symbol", retryno: "retry counter"}.
   *   its initial is {valid: "", symbolno: 0, retryno: 0}.
   */
  getValidSymbol: function (symbols, next, state) {
    var self = this;

    state = state || {
      valid: "",
      symbolno: 0,
      retryno: 0,
      err: undefined
    };

    if (state.valid === "" && state.symbolno < symbols.length) {
      // try to connect yahoo with a symbol candidate to confirm its validity.
      request({
        uri: "http://finance.yahoo.com/q?s=" + symbols[state.symbolno]
      }, function (err, res, body) {
        var upstate;

        if (err || res.statusCode != 200) {
          if (state.retryno < self.retryable) {
            // when connection error occurs, retry with same symbol
            upstate = {
              valid: "",
              symbolno: state.symbolno,
              retryno: ++state.retryno,
              err: undefined
            };
          } else {
            // give up to use a current symbol
            upstate = {
              valid: "",
              symbolno: ++state.symbolno,
              retryno: 0,
              err: err || new Error("status code is " + res.statusCode + ".")
            };
          }
        } else {
          var $ = cheerio.load(body);
          var flag = $("div#yfi_bd > div#yfi_investing_nav").length *
            $("div#yfi_bd > div#yfi_investing_content").length;

          if (flag > 0) {
            upstate = {
              valid: symbols[state.symbolno],
              symbolno: 0,
              retryno: 0,
              err: undefined
            };
          } else {
            upstate = {
              valid: "",
              symbolno: ++state.symbolno,
              retryno: 0,
              err: undefined
            };
          }
        }
        self.getValidSymbol(symbols, next, upstate);
      });
    } else {
      next.apply(null, [state.err, state.valid]);
    }
  },

  /**
   * get fundamentals (cash flow, income statement, balance sheet).
   *
   * @param {String} type must be set to "Cash Flow", "Income Statement" or "Balance Sheet".
   * @param {String} symbol must be enterprise's symbol string.
   * @param {String} term is optional and could be set to "annual" or "quarter".
   * @param {Object} optional. opt can contain "format" option.
   *   "format" can be set only "rarray", "carray" and "aarray".
   *     "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..].
   *     "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...].
   *     "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...].
   *     by default this is "ctable".
   * @param {Function} next must be set to the callback function with your arguments.
   *
   * @return {Object} {"Period Ending": [date,..], name0: [value, ...], ...}
   */
  getFundamentals: function (type, symbol, term, opt, next) {
    opt = opt || {};

    var nxarg = Array.prototype.slice.call(arguments, 5);
    var q = {
      name: type,
      // "c"ash "f"low to "cf"
      dir: type.split(" ").map(function (v) {
        return v.charAt(0).toLowerCase();
      }).join(""),
      // "cash flow" to +cash+flow
      para: type.replace(/^| /g, "+")
    };

    request({
      uri: "http://finance.yahoo.com/q/" + q.dir + "?s=" + symbol + q.para + "&" + (term || "annual")
    }, function (err, res, body) {
      var data;

      if (err || res.statusCode !== 200) {
        err = err || new Error("status code is " + res.statusCode + ".");
      } else {
        var $ = cheerio.load(body);
        $("td > spacer").parent().remove();
        //var title = $("big > b:contains('" + q.name + "')");
        //var nocont = $("p:contains('There is no'):contains('data available')");
        var items = $("table.yfnc_tabledata1 table").children("tr");

        if (items.length === 0) {
          err = new Error("response has no content.");
        } else {
          data = [];

          for (i = 0; i < items.length; i++) {
            // assign variable to each row
            var each = items.eq(i).children("td,th");

            // skip rows only with title or nothing.
            if (each.length < 2) {
              continue;
            }

            // get header
            var row = [];
            row.push(each.eq(0).text().replace(/^\s+|\s+$/g, ""));
            // get annual/quarterly fundamental data
            for (var j = 1; j < each.length; j++) {
              var val = each.eq(j).text().replace(/^\s+|\s+$|,/g, "");

              if (row[0] === "Period Ending") {
                // date in yahoo finance is in EST timezone.
                val = new Date(val + " EST");
              } else {
                // transform "(Number) to -Number"
                val = (val.match(/\(/))? "-" + val.replace(/\(|\)/g, "") : val;
                // change "-" to NaN
                val = (val === "-")? NaN : val;
                // values in yahoo finance is abbreviated of *1000.
                val = Number(val) * 1000;
              }
              row.push(val);
            }
            data.push(row);
          }

          data = opt.format === "rarray"? st.trans(data) : opt.format === "aarray"? csv.toDictionary(st.trans(data)) : data;
        }
      }

      next.apply(null, [err, data].concat(nxarg));
    });
  },

  /**
   * get yahoo's key statistics.
   *
   * @param {String} symbol must be enterprise's symbol string.
   * @param {Object} optional. opt can contain "format", "toNumber" option.
   *   "format" can be set only "rarray", "carray" and "aarray".
   *     "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..].
   *     "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...].
   *     "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...].
   *     by default this is "ctable".
   *     note that "json" is not suitable for getting this report, because the report has headers with the same name!
   *   "toNumber" might be true to return number in that key statistics is string.
   * @param {Function} next must be set to the callback function with your arguments.
   *
   * @return {Object} {"Period Ending": [date,..], name0: [value, ...], ...}
   */
  getKeyStatistics: function (symbol, opt, next) {
    opt = opt || {};

    var nxarg = Array.prototype.slice.call(arguments, 3);

    var q = {};
    q.name = "Key Statistics";
    q.dir = q.name.split(" ").map(function (v) {
      return v.charAt(0).toLowerCase();
    }).join("");
    q.para = q.name.replace(/^| /g, "+");

    request({
      uri: "http://finance.yahoo.com/q/" + q.dir + "?s=" + symbol + q.para
    }, function (err, res, body) {
      var table;

      if (err || res.statusCode !== 200) {
        err = err || new Error("status code is " + res.statusCode + ".");
      } else {
        // scraping cashflow data
        var $ = cheerio.load(body);
        $("font").remove();
        //var title = $("big > b:contains('" + q.name + "')");
        //var nocont = $("p:contains('There is no'):contains('data available')");
        var head = $("td.yfnc_tablehead1");
        var data = $("td.yfnc_tabledata1");

        // sometimes request cannot get main contents
        //if (title.length > 0 && head.length === 0 && nocont.length === 0) {
        if (head.length === 0) {
          err = new Error("response has no content.");
        } else {
          table = [];
          for (var i = 0; i < head.length; i++) {
            var txt = data.eq(i).text();
            var nmb = opt.toNumber? nm.toNumber(txt) : NaN;

            table.push([head.eq(i).text().replace(":", ""), isNaN(nmb)? txt : nmb]);
          }
          table = opt.format === "rarray"? st.trans(table) : opt.format === "aarray"? csv.toDictionary(st.trans(table)) : table;
        }
      }

      next.apply(null, [err, table].concat(nxarg));
    });
  },

  /**
   * get historical quotes.
   *
   * @param {String} symbol must be enterprise's symbol string.
   * @param {Object} opt contains options, which options are "interval", "begin", "end", "term" and "format".
   *   "interval" can take "d", "w", "m" or "q". they mean dayly, weekly, monthly or quartely respectively. by default, it is "w".
   *   "begin" can take Date object that indicates the top of the date of a period acquired quotes.
   *   "end" can take Date object that indicates the end of the date of a period acquired quotes.
   *   "term" can take Number (ms) that indicates a length of period of acquired quotes.
   *     without "begin" but with this option, acquired period is set from "end - term" and "end".
   *   "format" can be set only "rarray", "carray" and "aarray".
   *     "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..].
   *     "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...].
   *     "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...].
   *     by default this is "rtable".
   *   "toNumber" might be true to return number in that key statistics is string.
   * @param {Function} next must be set to the callback function with your arguments.
   */
  getQuotes : function (symbol, opt, next) {
    opt = opt || {};
    opt.term = opt.term || (1000 * 60 * 60 * 24 * 365 * 3);
    opt.interval = opt.interval || "w";
    opt.end = opt.end || new Date();
    opt.begin = opt.begin || new Date(opt.end.getTime() - opt.term);
    opt.format = opt.format || "rarray";
    opt.toNumber = opt.toNumber || false;

    var nxarg = Array.prototype.slice.call(arguments, 3);

    var url = "http://ichart.finance.yahoo.com/table.csv?" +
      "g="  + (opt.interval === "q"? "d" : opt.interval === "m"? "d" : opt.interval) +
      "&a=" + opt.begin.getUTCMonth() +
      "&b=" + opt.begin.getUTCDate() +
      "&c=" + opt.begin.getUTCFullYear() +
      "&d=" + opt.end.getUTCMonth() +
      "&e=" + opt.end.getUTCDate() +
      "&f=" + opt.end.getUTCFullYear() +
      "&s=" + symbol;

    /**
     * daily quotes to monthly/quarterly quotes.
     *
     * @param {Array} two-dim array.
     */
    function shorten (tbl) {
      var s, e;
      if (opt.interval === "q") {
        e = ts.nextQ(opt.end).add(-1).day();
        s = ts.currentQ(opt.end);
      } else if (opt.interval === "m") {
        e = new Date(opt.end).moveToLastDayOfMonth();
        s = new Date(opt.end).moveToFirstDayOfMonth();
      } else {
        e = opt.end;
        s = opt.begin;
      }

      var each = [undefined, undefined, -Infinity, Infinity, undefined, [], undefined],
          shortened = [];
      shortened.push(tbl[0]);

      for(var i = 1; i < tbl.length; i++) {
        // Date: the first day of period
        // Open: "open" value of the first day of period
        // High: higher in "high" value in period
        // Low : lower in "low" value in period
        // Close: "close" value of the last day of period
        // Volume: average of all day in period
        // Adj close: "adj close" value of the last day of period

        // yahoo.csv has dates with "yyyy-mm-dd" format, which causes new Date() to be UTC, so add its timezone.
        var d = new Date(tbl[i][0] + " EST");

        if (d.compareTo(s) === -1) {
          // set date, open, volume
          each[0] = tbl[i - 1][0];
          each[1] = tbl[i - 1][1];
          each[5] = Math.round(each[5].reduce(function (p, v) {
            return p + (v - 0);
          }, 0) / each[5].length) + "";

          // add shortened array
          shortened.push(each);

          // re-init
          each = [undefined, undefined, -Infinity, Infinity, undefined, [], undefined];
          e = d;
          if (opt.interval === "q") {
            s = ts.currentQ(e);
          } else if (opt.interval === "m") {
            s = new Date(e).moveToFirstDayOfMonth();
          } else {
            s = opt.begin;
          }
        }

        // set high, low, close and adj close, and add volume.
        each[2] = Math.max(tbl[i][2], each[2]) + "";
        each[3] = Math.min(tbl[i][3], each[3]) + "";
        each[4] = each[4] || tbl[i][4];
        each[5].push(tbl[i][5]);
        each[6] = each[6] || tbl[i][6];
      }

      // push last one
      // set date, open, volume
      each[0] = tbl[i - 1][0];
      each[1] = tbl[i - 1][1];
      each[5] = Math.round(each[5].reduce(function (p, v) {
        return p + (v - 0);
      }, 0) / each[5].length) + "";

      // add shortened array
      shortened.push(each);

      return shortened;
    }

    request({
      uri: url
    }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        err = err || new Error("status code is " + res.statusCode + ".");
      } else {
        // body is ocasionally empty due to unknown reason.
        if (body.length === 0) {
          err = new Error("response has no content.");
        } else {
          csv.parse(body, undefined, function (e, parsed) {
            if (e) {
              err = e;
              parsed = undefined;
            }

            if (opt.interval === "q" || opt.interval === "m") {
              parsed = shorten(parsed);
            }

            if (opt.toNumber) {
              // no need to numberize header
              for (var i = 1; i < parsed.length; i++) {
                // no need to numberize header
                for (var j = 1; j < parsed[i].length; j++) {
                  parsed[i][j] = nm.toNumber(parsed[i][j]) || parsed[i][j];
                }
              }
            }

            parsed = opt.format === "carray"? st.trans(parsed) : opt.format === "aarray"? csv.toDictionary(parsed) : parsed;

            next.apply(null, [err, parsed].concat(nxarg));
          });
        }
      }

      // error case
      if (err) {
        next.apply(null, [err, undefined].concat(nxarg));
      }
    });
  },

  /**
   * get historical volatility of given symbol.
   *
   * @param {String} symbol must be enterprise's symbol string.
   * @param {Object} opt contains options, which options are "numberOfDay" and getQuotes option ("interval", "begin", "end" and "term"),
   *   even though "format" and "toNumber" of getQuotes's options are invalid.
   *   "numberOfDay" means the number of days in year. by default, it is 250.
   * @param {Function} next must be set to the callback function with your arguments.
   */
  getHV: function (symbol, opt, next) {
    opt = opt || {};
    // overwrite user option.
    opt.format = "carray";
    opt.toNumber = true;

    var nxarg = Array.prototype.slice.call(arguments, 3);

    this.getQuotes(symbol, opt, function (err, tcsv) {
      var hv;

      if (!err) {
        // use only close data
        var price = tcsv[4];
        // delete header
        price.shift();
        hv = st.hv(price, opt.numberOfDay);
      }

      next.apply(null, [err, hv].concat(nxarg));
    });
  },

  /**
   * get risk free rate.
   *
   * @param {Number} maturity can be set by the number of month. by default it's 12 * 10 (10 year).
   * @param {Function} next must be set to the callback function with your arguments.
   */
  getRiskFreeRate: function (maturity, next) {
    var nxarg = Array.prototype.slice.call(arguments, 2);
    var url = "http://finance.yahoo.com/bonds";

    maturity = maturity || 12 * 10;
    var pos = maturity <= 3? 1 :
      maturity <= 6? 2 :
      maturity <= 24? 3 :
      maturity <= 36? 4 :
      maturity <= 60? 5 :
      maturity <= 120? 6 : 7;

    request({
      uri: url
    }, function (err, res, body) {
      var rfr = 0;

      if (err || res.statusCode !== 200) {
        err = err || new Error("status code is " + res.statusCode + ".");
      } else {
        // sometimes request cannot get main contents
        if (body.length === 0) {
          // should retry, overwrite error object and statuscode
          err = new Error("response has no content.");
        } else {
          var $ = cheerio.load(body);
          // US treasury bonds rate of 10 years
          rfr = $("table.yfirttbl > tbody > tr:nth-child(" + pos + ") > td:nth-child(2)").text() / 100;
        }
      }
      next.apply(null, [err, rfr].concat(nxarg));
    });
  }
};
