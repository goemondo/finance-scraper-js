/**
 * Module dependencies.
 */
var cp = require("omotenashi-js").copy;

module.exports = {
  /**
   * create url string with {url: String, query: {q[0]: String, ..}}.
   *
   * @param {Object} base is formatted into {url: String, query: {q[0]: String, ..}}. base.query is optional.
   * @param {Object} qins is optional and instance for base.query.
   * @return {String} url string.
   */
  toURL: function (base, qins) {
    var url = base.url,
        q = cp.copy(true, qins, undefined, base.query);

    if (q) {
      url += "?";
      for (var p in q) {
        url += p + "=" + (q[p]) + "&";
      }
      // eliminate last "&"
      url.substring(0, url.length - 1);
    }

    return url;
  }
};