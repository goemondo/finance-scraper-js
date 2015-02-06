var should = require("should");
var nasdaq = require("../lib/nasdaq");

describe("scraping from nasdaq.", function () {
  describe("main function test (divided responses).", function () {
    it("test without option.", function (done) {
      this.timeout(0);

      var i = 0,
          len = "Z".charCodeAt(0) - "A".charCodeAt(0) + 1;

      nasdaq(undefined, function (e, l, f) {
        should.not.exist(e, "error may require checking connection to re-test. :" + e);

        (l.length > 0).should.be.true;
        (l[0].join().search(/Symbol|Name|LastSale|MarketCap|IPOyear|Sector|industry|Summary Quote/) !== -1).should.be.true;

        console.log("scraping a group of enterprises has been finished (" + (++i) + "/" + len + ").");
        if (f) {
          done();
        }
      });
    });

    it("test with option.", function (done) {
      this.timeout(0);

      var i = 0,
          len = "Z".charCodeAt(0) - "A".charCodeAt(0) + 1;

      nasdaq({
        format: "aarray"
      }, function (e, l, f) {
        should.not.exist(e, "error may require checking connection to re-test. :" + e);

        (l.length > 0).should.be.true;
        (Object.keys(l[0]).join().search(/Symbol|Name|LastSale|MarketCap|IPOyear|Sector|industry|Summary Quote/) !== -1).should.be.true;

        console.log("scraping a group of enterprises has been finished (" + (++i) + "/" + len + ").");
        if (f) {
          done();
        }
      });
    });
  });

  describe("sub function test (grouped response for backward compatibility).", function () {
    it("test without option.", function (done) {
      this.timeout(0);

      nasdaq.getCompaniesList(function (e, l) {
        should.not.exist(e, "error may require checking connection to re-test. :" + e);

        (l.length > 0).should.be.true;
        (Object.keys(l[0]).join().search(/Symbol|Name|LastSale|MarketCap|IPOyear|Sector|industry|Summary Quote/) !== -1).should.be.true;

        done();
      });
    });
  });
});