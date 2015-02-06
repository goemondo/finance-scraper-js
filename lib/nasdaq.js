/**
 * Module dependencies.
 */

var request = require("request");
var csv = require("omotenashi-js").csv;
var util = require("./util");

var nasdaq = {
  url: "http://www.nasdaq.com/screening/companies-by-name.aspx",
  query: {
    "render": "download",
    "letter": undefined
  }
};

/**
 * acquire enterprise list.
 *
 * @param {Object} opt contains below options.
 *    opt can have "format" property.
 *      "format" can be set to "rarray" or "aarray", each of which means array of arrays, javascript object respectively.
 * @param {Function} next is callback function.
 *    this is called several time (now 26 times maximumly) in each time getting a part of list.
 *    this has error, enterprise list, flag and your originals in its arguments. the "flag" will be set true in last call.
 * @return {none}
 */
module.exports = getCompaniesList = function (opt, next) {
  var cbarg = Array.prototype.slice.call(arguments, 2);
  var parts = 0,
      cpart = 0;

  /**
   * heartbeat to nasdaq
   *
   * @return {none} this call getBodies function.
   */
  function heartbeat () {
    request({
      url: util.toURL(nasdaq, {letter: "."})
    }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        err = err || new Error("status code is " + res.statusCode + ".");
        err.message = "heartbeat cannot reach to nasdaq: " + err.message;

        // cannot get header, and give up to get body.
        next.apply(null, [err, undefined, true].concat(cbarg));
      } else {
        getBodies();
      }
    });
  }

  /**
   * control to get all of enterprise's profile.
   *
   * @return {none} this call getBody function.
   */
  function getBodies () {
    var str = "A".charCodeAt(0), end = "Z".charCodeAt(0);
    parts = end - str + 1;

    for (var i = str; i <= end; i++) {
      // access nasdaq slowly.
      setTimeout(getBody, (i - str + 1) * 1000, i);
    }
  }

  /**
   * get enterprise's profiles whose initial word is "idx".
   *
   * @return {none} this call next function.
   */
  function getBody (idx) {
    var charcode = String.fromCharCode(idx);

    request({
      uri: util.toURL(nasdaq, {letter: charcode})
    }, function (err, res, body) {
      var list;

      if (!err && res.statusCode === 200) {
        // string to csv/json
        list = csv.parse(body, {
          delim: ",",
          trimLastDelim: true,
          asType: true,
          toDict: opt && opt.format === "aarray",
          header: undefined
        });
      } else {
        err = err || new Error("status code is " + res.statusCode + ".");
      }

      next.apply(null, [err, list, ++cpart === parts].concat(cbarg));
    });
  }

  // get it started to collect companies profile.
  heartbeat();
};

// for backward compatibility
module.exports.getCompaniesList = function (next) {
  var cbarg = Array.prototype.slice.call(arguments, 1);
  var e = [], result = [];

  getCompaniesList({format: "aarray"}, function (err, list, last) {
    if (err) {
      e.push(err);
    } else if (list.length > 0) {
      result = result.concat(list);
    }

    if (last) {
      next.apply(null, [e.length? e : undefined, result].concat(cbarg));
    }
  });
};
