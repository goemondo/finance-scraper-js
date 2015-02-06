var should = require("should");
var yahoo = require("../lib/yahoo");
require("./date");

describe("scraping from yahoo.", function () {
  describe("getValidSymbol.", function () {
    it("GOOGL.", function (done) {
      this.timeout(0);

      yahoo.getValidSymbol(yahoo.getSymbolCandidates("GOOGL"), function (err, symbol) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        symbol.should.eql("GOOGL");

        done();
      });
    });

    it("^2-P.", function (done) {
      this.timeout(0);

      yahoo.getValidSymbol(yahoo.getSymbolCandidates("ADK^A"), function (err, symbol) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        symbol.should.eql("ADK-PA");

        done();
      });
    });
  });

  describe("getFundamentals.", function () {
    it("invalid type.", function (done) {
      this.timeout(0);

      var a = [];

      yahoo.getFundamentals("Category Goal", "AAA", "annual", undefined, function (err, report) {
        should.exist(err);
        should.not.exist(report);
        err.message.should.eql("status code is 404.");

        done();
      });
    });

    it("invalid symbol.", function (done) {
      this.timeout(0);

      var a = [];

      yahoo.getFundamentals("Cash Flow", "AAA", "annual", undefined, function (err, report) {
        should.exist(err);
        should.not.exist(report);
        err.message.should.eql("response has no content.");

        done();
      });
    });

    it("cash flow, existing symbol, yearly, without option.", function (done) {
      this.timeout(0);

      var a = [
        ['Period Ending', Date, Date, Date],
        ['Net Income', Number, Number, Number],
        ['Depreciation', Number, Number, Number],
        ['Adjustments To Net Income', Number, Number, Number],
        ['Changes In Accounts Receivables', Number, Number, Number],
        ['Changes In Liabilities', Number, Number, Number],
        ['Changes In Inventories', Number, Number, Number],
        ['Changes In Other Operating Activities', Number, Number, Number],
        ['Total Cash Flow From Operating Activities', Number, Number, Number],
        ['Capital Expenditures', Number, Number, Number],
        ['Investments', Number, Number, Number],
        ['Other Cash flows from Investing Activities', Number, Number, Number],
        ['Total Cash Flows From Investing Activities', Number, Number, Number],
        ['Dividends Paid', Number, Number, Number],
        ['Sale Purchase of Stock', Number, Number, Number],
        ['Net Borrowings', Number, Number, Number],
        ['Other Cash Flows from Financing Activities', Number, Number, Number],
        ['Total Cash Flows From Financing Activities', Number, Number, Number],
        ['Effect Of Exchange Rate Changes', Number, Number, Number],
        ['Change In Cash and Cash Equivalents', Number, Number, Number]
      ];

      yahoo.getFundamentals("Cash Flow", "AMZN", "annual", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[0].length; j++) {
            if (j === 0) {
              report[i][j].should.eql(a[i][j]);
            } else {
                // typeof NaN is "number"
                report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("cash flow, existing symbol, quarterly, without option.", function (done) {
      this.timeout(0);

      var a = [
        ['Period Ending', Date, Date, Date, Date],
        ['Net Income', Number, Number, Number, Number],
        ['Depreciation', Number, Number, Number, Number],
        ['Adjustments To Net Income', Number, Number, Number, Number],
        ['Changes In Accounts Receivables', Number, Number, Number, Number],
        ['Changes In Liabilities', Number, Number, Number, Number],
        ['Changes In Inventories', Number, Number, Number, Number],
        ['Changes In Other Operating Activities', Number, Number, Number, Number],
        ['Total Cash Flow From Operating Activities', Number, Number, Number, Number],
        ['Capital Expenditures', Number, Number, Number, Number],
        ['Investments', Number, Number, Number, Number],
        ['Other Cash flows from Investing Activities', Number, Number, Number, Number],
        ['Total Cash Flows From Investing Activities', Number, Number, Number, Number],
        ['Dividends Paid', Number, Number, Number, Number],
        ['Sale Purchase of Stock', Number, Number, Number, Number],
        ['Net Borrowings', Number, Number, Number, Number],
        ['Other Cash Flows from Financing Activities', Number, Number, Number, Number],
        ['Total Cash Flows From Financing Activities', Number, Number, Number, Number],
        ['Effect Of Exchange Rate Changes', Number, Number, Number, Number],
        ['Change In Cash and Cash Equivalents', Number, Number, Number, Number]
      ];

      yahoo.getFundamentals("Cash Flow", "P", "quarter", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[0].length; j++) {
            if (j === 0) {
              report[i][j].should.eql(a[i][j]);
            } else {
                // typeof NaN is "number"
                report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("cash flow, existing symbol, yearly, with format (row-oriented) option.", function (done) {
      this.timeout(0);

      var a = [
        ['Period Ending', 'Net Income', 'Depreciation', 'Adjustments To Net Income', 'Changes In Accounts Receivables',
         'Changes In Liabilities', 'Changes In Inventories', 'Changes In Other Operating Activities',
         'Total Cash Flow From Operating Activities', 'Capital Expenditures', 'Investments',
         'Other Cash flows from Investing Activities', 'Total Cash Flows From Investing Activities',
         'Dividends Paid', 'Sale Purchase of Stock', 'Net Borrowings',
         'Other Cash Flows from Financing Activities', 'Total Cash Flows From Financing Activities',
         'Effect Of Exchange Rate Changes', 'Change In Cash and Cash Equivalents' ],
        [Date, Number, Number, Number, Number, Number, Number, Number, Number, Number, Number,
         Number, Number, Number, Number, Number, Number, Number, Number, Number],
        [Date, Number, Number, Number, Number, Number, Number, Number, Number, Number, Number,
         Number, Number, Number, Number, Number, Number, Number, Number, Number],
        [Date, Number, Number, Number, Number, Number, Number, Number, Number, Number, Number,
         Number, Number, Number, Number, Number, Number, Number, Number, Number]
      ];

      yahoo.getFundamentals("Cash Flow", "AMZN", "annual", {format: "rarray"}, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[0].length; j++) {
            if (i === 0) {
              report[i][j].should.eql(a[i][j]);
            } else {
              report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("cash flow, existing symbol, yearly, with format (dictionary) option.", function (done) {
      this.timeout(0);

      var ansparts = {
        'Period Ending': Date,
        'Net Income': Number,
        'Depreciation': Number,
        'Adjustments To Net Income': Number,
        'Changes In Accounts Receivables': Number,
        'Changes In Liabilities': Number,
        'Changes In Inventories': Number,
        'Changes In Other Operating Activities': Number,
        'Total Cash Flow From Operating Activities': Number,
        'Capital Expenditures': Number,
        'Investments': Number,
        'Other Cash flows from Investing Activities': Number,
        'Total Cash Flows From Investing Activities': Number,
        'Dividends Paid': Number,
        'Sale Purchase of Stock': Number,
        'Net Borrowings': Number,
        'Other Cash Flows from Financing Activities': Number,
        'Total Cash Flows From Financing Activities': Number,
        'Effect Of Exchange Rate Changes': Number,
        'Change In Cash and Cash Equivalents': Number
      };
      var a = [ansparts, ansparts, ansparts];

      yahoo.getFundamentals("Cash Flow", "AMZN", "annual", {format: "aarray"}, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j in report[i]) {
            report[i][j].should.be.instanceOf(a[i][j]);
          }
        }

        done();
      });
    });

    it("income statement, existing symbol, yearly, without option.", function (done) {
      this.timeout(0);

      var a = [
        ['Period Ending', Date, Date, Date],
        ['Total Revenue', Number, Number, Number],
        ['Cost of Revenue', Number, Number, Number],
        ['Gross Profit', Number, Number, Number],
        ['Research Development', Number, Number, Number],
        ['Selling General and Administrative', Number, Number, Number],
        ['Non Recurring', Number, Number, Number],
        ['Others', Number, Number, Number],
        ['Total Operating Expenses', Number, Number, Number],
        ['Operating Income or Loss', Number, Number, Number],
        ['Total Other Income/Expenses Net', Number, Number, Number],
        ['Earnings Before Interest And Taxes', Number, Number, Number],
        ['Interest Expense', Number, Number, Number],
        ['Income Before Tax', Number, Number, Number],
        ['Income Tax Expense', Number, Number, Number],
        ['Minority Interest', Number, Number, Number],
        ['Net Income From Continuing Ops', Number, Number, Number],
        ['Discontinued Operations', Number, Number, Number],
        ['Extraordinary Items', Number, Number, Number],
        ['Effect Of Accounting Changes', Number, Number, Number],
        ['Other Items', Number, Number, Number],
        ['Net Income', Number, Number, Number],
        ['Preferred Stock And Other Adjustments', Number, Number, Number],
        ['Net Income Applicable To Common Shares', Number, Number, Number]
      ];

      yahoo.getFundamentals("Income Statement", "FDX", "annual", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[0].length; j++) {
            if (j === 0) {
              report[i][j].should.eql(a[i][j]);
            } else {
                // typeof NaN is "number"
                report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("balance sheet, existing symbol, yearly, without option.", function (done) {
      this.timeout(0);

      var a = [
        ['Period Ending', Date, Date, Date],
        ['Cash And Cash Equivalents', Number, Number, Number],
        ['Short Term Investments', Number, Number, Number],
        ['Net Receivables', Number, Number, Number],
        ['Inventory', Number, Number, Number],
        ['Other Current Assets', Number, Number, Number],
        ['Total Current Assets', Number, Number, Number],
        ['Long Term Investments', Number, Number, Number],
        ['Property Plant and Equipment', Number, Number, Number],
        ['Goodwill', Number, Number, Number],
        ['Intangible Assets', Number, Number, Number],
        ['Accumulated Amortization', Number, Number, Number],
        ['Other Assets', Number, Number, Number],
        ['Deferred Long Term Asset Charges', Number, Number, Number],
        ['Total Assets', Number, Number, Number],
        ['Accounts Payable', Number, Number, Number],
        ['Short/Current Long Term Debt', Number, Number, Number],
        ['Other Current Liabilities', Number, Number, Number],
        ['Total Current Liabilities', Number, Number, Number],
        ['Long Term Debt', Number, Number, Number],
        ['Other Liabilities', Number, Number, Number],
        ['Deferred Long Term Liability Charges', Number, Number, Number],
        ['Minority Interest', Number, Number, Number],
        ['Negative Goodwill', Number, Number, Number],
        ['Total Liabilities', Number, Number, Number],
        ['Misc Stocks Options Warrants', Number, Number, Number],
        ['Redeemable Preferred Stock', Number, Number, Number],
        ['Preferred Stock', Number, Number, Number],
        ['Common Stock', Number, Number, Number],
        ['Retained Earnings', Number, Number, Number],
        ['Treasury Stock', Number, Number, Number],
        ['Capital Surplus', Number, Number, Number],
        ['Other Stockholder Equity', Number, Number, Number],
        ['Total Stockholder Equity', Number, Number, Number],
        ['Net Tangible Assets', Number, Number, Number]
      ];

      yahoo.getFundamentals("Balance Sheet", "FDX", "annual", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[0].length; j++) {
            if (j === 0) {
              report[i][j].should.eql(a[i][j]);
            } else {
                // typeof NaN is "number"
                report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });
  });

  describe("getKeyStatistics.", function () {
    it("invalid symbol.", function (done) {
      this.timeout(0);

      var a = [];

      yahoo.getKeyStatistics("AAA", undefined, function (err, report) {
        should.exist(err);
        should.not.exist(report);
        err.message.should.eql("response has no content.");

        done();
      });
    });

    it("valid symbol without option.", function (done) {
      this.timeout(0);

      var a = [
        ['Market Cap (intraday)', String],
        ['Enterprise Value', String],
        ['Trailing P/E (ttm, intraday)', String],
        ['Forward P/E', String],
        ['PEG Ratio (5 yr expected)', String],
        ['Price/Sales (ttm)', String],
        ['Price/Book (mrq)', String],
        ['Enterprise Value/Revenue (ttm)', String],
        ['Enterprise Value/EBITDA (ttm)', String],
        ['Fiscal Year Ends', String],
        ['Most Recent Quarter (mrq)', String],
        ['Profit Margin (ttm)', String],
        ['Operating Margin (ttm)', String],
        ['Return on Assets (ttm)', String],
        ['Return on Equity (ttm)', String],
        ['Revenue (ttm)', String],
        ['Revenue Per Share (ttm)', String],
        ['Qtrly Revenue Growth (yoy)', String],
        ['Gross Profit (ttm)', String],
        ['EBITDA (ttm)', String],
        ['Net Income Avl to Common (ttm)', String],
        ['Diluted EPS (ttm)', String],
        ['Qtrly Earnings Growth (yoy)', String],
        ['Total Cash (mrq)', String],
        ['Total Cash Per Share (mrq)', String],
        ['Total Debt (mrq)', String],
        ['Total Debt/Equity (mrq)', String],
        ['Current Ratio (mrq)', String],
        ['Book Value Per Share (mrq)', String],
        ['Operating Cash Flow (ttm)', String],
        ['Levered Free Cash Flow (ttm)', String],
        ['Beta', String],
        ['52-Week Change', String],
        ['S&P500 52-Week Change', String],
        ['52-Week High', String],
        ['52-Week Low', String],
        ['50-Day Moving Average', String],
        ['200-Day Moving Average', String],
        ['Avg Vol (3 month)', String],
        ['Avg Vol (10 day)', String],
        ['Shares Outstanding', String],
        ['Float', String],
        ['% Held by Insiders', String],
        ['% Held by Institutions', String],
        ['Shares Short', String],
        ['Short Ratio', String],
        ['Short % of Float', String],
        ['Shares Short (prior month)', String],
        ['Forward Annual Dividend Rate', String],
        ['Forward Annual Dividend Yield', String],
        ['Trailing Annual Dividend Yield', String],
        ['Trailing Annual Dividend Yield', String],
        ['5 Year Average Dividend Yield', String],
        ['Payout Ratio', String],
        ['Dividend Date', String],
        ['Ex-Dividend Date', String],
        ['Last Split Factor (new per old)', String],
        ['Last Split Date', String]
      ];

      yahoo.getKeyStatistics("AAPL", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[i].length; j++) {
            if (j === 0) {
              report[i][j].should.startWith(a[i][j]);
            } else {
                report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("valid symbol with toNumber option.", function (done) {
      this.timeout(0);

      var a = [
        ['Market Cap (intraday)', "number"],
        ['Enterprise Value', "number"],
        ['Trailing P/E (ttm, intraday)', "number"],
        ['Forward P/E', "number"],
        ['PEG Ratio (5 yr expected)', "number"],
        ['Price/Sales (ttm)', "number"],
        ['Price/Book (mrq)', "number"],
        ['Enterprise Value/Revenue (ttm)', "number"],
        ['Enterprise Value/EBITDA (ttm)', "number"],
        ['Fiscal Year Ends', "string"],
        ['Most Recent Quarter (mrq)', "string"],
        ['Profit Margin (ttm)', "number"],
        ['Operating Margin (ttm)', "number"],
        ['Return on Assets (ttm)', "number"],
        ['Return on Equity (ttm)', "number"],
        ['Revenue (ttm)', "number"],
        ['Revenue Per Share (ttm)', "number"],
        ['Qtrly Revenue Growth (yoy)', "number"],
        ['Gross Profit (ttm)', "number"],
        ['EBITDA (ttm)', "number"],
        ['Net Income Avl to Common (ttm)', "number"],
        ['Diluted EPS (ttm)', "number"],
        ['Qtrly Earnings Growth (yoy)', "number"],
        ['Total Cash (mrq)', "number"],
        ['Total Cash Per Share (mrq)', "number"],
        ['Total Debt (mrq)', "number"],
        ['Total Debt/Equity (mrq)', "number"],
        ['Current Ratio (mrq)', "number"],
        ['Book Value Per Share (mrq)', "number"],
        ['Operating Cash Flow (ttm)', "number"],
        ['Levered Free Cash Flow (ttm)', "number"],
        ['Beta', "number"],
        ['52-Week Change', "number"],
        ['S&P500 52-Week Change', "number"],
        ['52-Week High', "number"],
        ['52-Week Low', "number"],
        ['50-Day Moving Average', "number"],
        ['200-Day Moving Average', "number"],
        ['Avg Vol (3 month)', "number"],
        ['Avg Vol (10 day)', "number"],
        ['Shares Outstanding', "number"],
        ['Float', "number"],
        ['% Held by Insiders', "number"],
        ['% Held by Institutions', "number"],
        ['Shares Short', "number"],
        ['Short Ratio', "number"],
        ['Short % of Float', "number"],
        ['Shares Short (prior month)', "number"],
        ['Forward Annual Dividend Rate', "number"],
        ['Forward Annual Dividend Yield', "number"],
        ['Trailing Annual Dividend Yield', "number"],
        ['Trailing Annual Dividend Yield', "number"],
        ['5 Year Average Dividend Yield', "number"],
        ['Payout Ratio', "number"],
        ['Dividend Date', "string"],
        ['Ex-Dividend Date', "string"],
        ['Last Split Factor (new per old)', "string"],
        ['Last Split Date', "string"]
      ];

      var option = {
        toNumber: true
      };

      yahoo.getKeyStatistics("ZU", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[i].length; j++) {
            if (j === 0) {
              report[i][j].should.startWith(a[i][j]);
            } else {
                (typeof report[i][j] === a[i][j] || report[i][j] === "N/A").should.be.true;
                // report[i][j].should.be.instanceOf(a[i][j]);
            }
          }
        }

        done();
      });
    });

    it("valid symbol with format (row-oriented) option.", function (done) {
      this.timeout(0);

      var a = [
        ['Market Cap (intraday)', String],
        ['Enterprise Value', String],
        ['Trailing P/E (ttm, intraday)', String],
        ['Forward P/E', String],
        ['PEG Ratio (5 yr expected)', String],
        ['Price/Sales (ttm)', String],
        ['Price/Book (mrq)', String],
        ['Enterprise Value/Revenue (ttm)', String],
        ['Enterprise Value/EBITDA (ttm)', String],
        ['Fiscal Year Ends', String],
        ['Most Recent Quarter (mrq)', String],
        ['Profit Margin (ttm)', String],
        ['Operating Margin (ttm)', String],
        ['Return on Assets (ttm)', String],
        ['Return on Equity (ttm)', String],
        ['Revenue (ttm)', String],
        ['Revenue Per Share (ttm)', String],
        ['Qtrly Revenue Growth (yoy)', String],
        ['Gross Profit (ttm)', String],
        ['EBITDA (ttm)', String],
        ['Net Income Avl to Common (ttm)', String],
        ['Diluted EPS (ttm)', String],
        ['Qtrly Earnings Growth (yoy)', String],
        ['Total Cash (mrq)', String],
        ['Total Cash Per Share (mrq)', String],
        ['Total Debt (mrq)', String],
        ['Total Debt/Equity (mrq)', String],
        ['Current Ratio (mrq)', String],
        ['Book Value Per Share (mrq)', String],
        ['Operating Cash Flow (ttm)', String],
        ['Levered Free Cash Flow (ttm)', String],
        ['Beta', String],
        ['52-Week Change', String],
        ['S&P500 52-Week Change', String],
        ['52-Week High', String],
        ['52-Week Low', String],
        ['50-Day Moving Average', String],
        ['200-Day Moving Average', String],
        ['Avg Vol (3 month)', String],
        ['Avg Vol (10 day)', String],
        ['Shares Outstanding', String],
        ['Float', String],
        ['% Held by Insiders', String],
        ['% Held by Institutions', String],
        ['Shares Short', String],
        ['Short Ratio', String],
        ['Short % of Float', String],
        ['Shares Short (prior month)', String],
        ['Forward Annual Dividend Rate', String],
        ['Forward Annual Dividend Yield', String],
        ['Trailing Annual Dividend Yield', String],
        ['Trailing Annual Dividend Yield', String],
        ['5 Year Average Dividend Yield', String],
        ['Payout Ratio', String],
        ['Dividend Date', String],
        ['Ex-Dividend Date', String],
        ['Last Split Factor (new per old)', String],
        ['Last Split Date', String]
      ];

      var option = {
        format: "rarray"
      };

      yahoo.getKeyStatistics("AAPL", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        for (var i = 0; i < report.length; i++) {
          for (var j = 0; j < report[i].length; j++) {
            if (i === 0) {
              report[i][j].should.startWith(a[j][i]);
            } else {
                report[i][j].should.be.instanceOf(a[j][i]);
            }
          }
        }

        done();
      });
    });

    it("valid symbol with format (dictionary) option.", function (done) {
      this.timeout(0);

      var a = [
        ['Market Cap (intraday)', String],
        ['Enterprise Value', String],
        ['Trailing P/E (ttm, intraday)', String],
        ['Forward P/E', String],
        ['PEG Ratio (5 yr expected)', String],
        ['Price/Sales (ttm)', String],
        ['Price/Book (mrq)', String],
        ['Enterprise Value/Revenue (ttm)', String],
        ['Enterprise Value/EBITDA (ttm)', String],
        ['Fiscal Year Ends', String],
        ['Most Recent Quarter (mrq)', String],
        ['Profit Margin (ttm)', String],
        ['Operating Margin (ttm)', String],
        ['Return on Assets (ttm)', String],
        ['Return on Equity (ttm)', String],
        ['Revenue (ttm)', String],
        ['Revenue Per Share (ttm)', String],
        ['Qtrly Revenue Growth (yoy)', String],
        ['Gross Profit (ttm)', String],
        ['EBITDA (ttm)', String],
        ['Net Income Avl to Common (ttm)', String],
        ['Diluted EPS (ttm)', String],
        ['Qtrly Earnings Growth (yoy)', String],
        ['Total Cash (mrq)', String],
        ['Total Cash Per Share (mrq)', String],
        ['Total Debt (mrq)', String],
        ['Total Debt/Equity (mrq)', String],
        ['Current Ratio (mrq)', String],
        ['Book Value Per Share (mrq)', String],
        ['Operating Cash Flow (ttm)', String],
        ['Levered Free Cash Flow (ttm)', String],
        ['Beta', String],
        ['52-Week Change', String],
        ['S&P500 52-Week Change', String],
        ['52-Week High', String],
        ['52-Week Low', String],
        ['50-Day Moving Average', String],
        ['200-Day Moving Average', String],
        ['Avg Vol (3 month)', String],
        ['Avg Vol (10 day)', String],
        ['Shares Outstanding', String],
        ['Float', String],
        ['% Held by Insiders', String],
        ['% Held by Institutions', String],
        ['Shares Short', String],
        ['Short Ratio', String],
        ['Short % of Float', String],
        ['Shares Short (prior month)', String],
        ['Forward Annual Dividend Rate', String],
        ['Forward Annual Dividend Yield', String],
        // in json, below one with the same header overwrites this
        // ['Trailing Annual Dividend Yield', String],
        ['Trailing Annual Dividend Yield', String],
        ['5 Year Average Dividend Yield', String],
        ['Payout Ratio', String],
        ['Dividend Date', String],
        ['Ex-Dividend Date', String],
        ['Last Split Factor (new per old)', String],
        ['Last Split Date', String]
      ];

      var option = {
        format: "aarray"
      };

      yahoo.getKeyStatistics("AAPL", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);

        Object.keys(report[0]).forEach(function (v, i) {
          v.should.startWith(a[i][0]);
          report[0][v].should.be.instanceOf(a[i][1]);
        });

        done();
      });
    });
  });

  describe("getQuotes.", function () {
    it("invalid symbol.", function (done) {
      this.timeout(0);

      yahoo.getQuotes("AAA", undefined, function (err, report) {
        should.exist(err);
        should.not.exist(report);
        err.message.should.eql("status code is 404.");

        done();
      });
    });

    it("valid symbol without options.", function (done) {
      this.timeout(0);

      // set today in timezone GMT+0 because we use toJSON, which returns UTC time, afterward.
      var d = new Date();
      d = new Date(d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + " GMT+0");
      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [d.last().monday().toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [String, String, String, String, String, String, String]
      ];

      yahoo.getQuotes("AMZN", undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.above(4 * 12 * 3);

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (i === 1 && j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[Math.min(i, 2)][j]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with toNumber options.", function (done) {
      this.timeout(0);

      // set today in timezone GMT+0 because we use toJSON, which returns UTC time, afterward.
      var d = new Date();
      d = new Date(d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + " GMT+0");
      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [d.last().monday().toJSON().replace(/T.*/, ""), Number, Number, Number, Number, Number, Number],
         [String, Number, Number, Number, Number, Number, Number]
      ];
      var option = {
        toNumber: true
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.above(4 * 12 * 3);

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (i === 1 && j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[Math.min(i, 2)][j]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with format (column-oriented) options.", function (done) {
      this.timeout(0);

      var a = [
         ["Date", String],
         ["Open", String],
         ["High", String],
         ["Low", String],
         ["Close", String],
         ["Volume", String],
         ["Adj Close", String]
      ];
      var option = {
        format: "carray"
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[i][1]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with format (dictionary) options.", function (done) {
      this.timeout(0);

      var a = {
        "Date": String,
        "Open": String,
        "High": String,
        "Low": String,
        "Close": String,
        "Volume": String,
        "Adj Close": String
      };
      var option = {
        format: "aarray"
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.forEach(function (v, i) {
          Object.keys(v).forEach(function (w, j) {
            v[w].should.be.instanceOf(a[w]);
          });
        });

        done();
      });
    });

    it("valid symbol with term options.", function (done) {
      this.timeout(0);

      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [new Date("Dec 19, 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [String, String, String, String, String, String, String]
      ];
      var option = {
        interval: "d", // for easily testing
        end: new Date("Dec 19, 2014 EST"),
        term: 1000 * 60 * 60 * 24 * 3
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.be.eql(option.term / 1000 / 60 / 60 / 24 + 1 + 1); // 1 for header

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (i === 1 && j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[Math.min(i, 2)][j]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with begin options.", function (done) {
      this.timeout(0);

      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [new Date("Dec 19, 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [String, String, String, String, String, String, String]
      ];
      var option = {
        interval: "d", // for easily testing
        end: new Date("Dec 19, 2014 EST"),
        begin: new Date("Dec 17, 2014 EST")
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.be.eql((option.end.getTime() - option.begin.getTime()) / 1000 / 60 / 60 / 24 + 1 + 1); // 1 for header

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (i === 1 && j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[Math.min(i, 2)][j]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with interval (monthly) options.", function (done) {
      this.timeout(0);

      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [new Date("Dec 1 , 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [new Date("Nov 10, 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String]
      ];
      var option = {
        interval: "m", // for easily testing
        end: new Date("Dec 19, 2014 EST"),
        begin: new Date("Nov 10, 2014 EST")
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.be.eql(2 + 1); // 1 for header

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[i][j]);
            }
          });
        });

        done();
      });
    });

    it("valid symbol with interval (quarterly) options.", function (done) {
      this.timeout(0);

      var a = [
         ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
         [new Date("Oct 1 , 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [new Date("Jul 1 , 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String],
         [new Date("Apr 10, 2014 EST").toJSON().replace(/T.*/, ""), String, String, String, String, String, String]
      ];
      var option = {
        interval: "q", // for easily testing
        end: new Date("Dec 19, 2014 EST"),
        begin: new Date("Apr 10, 2014 EST")
      };

      yahoo.getQuotes("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.length.should.be.eql(3 + 1); // 1 for header

        report.forEach(function (v, i) {
          v.forEach(function (v, j) {
            if (i === 0) {
              v.should.be.eql(a[i][j]);
            } else if (j === 0) {
              v.should.be.eql(a[i][j]);
            } else {
              v.should.be.instanceOf(a[i][j]);
            }
          });
        });

        done();
      });
    });
  });

  describe("getHV.", function () {
    it("invalid symbol.", function (done) {
      this.timeout(0);

      yahoo.getHV("AAA", undefined, function (err, report) {
        should.exist(err);
        should.not.exist(report);
        err.message.should.eql("status code is 404.");

        done();
      });
    });

    // for test, "begin/term" and "end" are needed, so we cannot test "without option" one.
    it("valid symbol with begin/end options.", function (done) {
      this.timeout(0);

      // calc by excel stdevp function.
      var a = 0.33;
      var option = {
        end: new Date("Dec 31, 2014"),
        begin: new Date("Jan 1, 2014"),
        interval: "d"
      };

      yahoo.getHV("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        (report.toFixed(2) - 0).should.be.eql(a);

        done();
      });
    });

    it("valid symbol with numberOfDay options.", function (done) {
      this.timeout(0);

      // calc by excel stdevp function.
      var a = 0.40;
      var option = {
        end: new Date("Dec 31, 2014"),
        begin: new Date("Jan 1, 2014"),
        interval: "d",
        numberOfDay: 365
      };

      yahoo.getHV("AMZN", option, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        (report.toFixed(2) - 0).should.be.eql(a);

        done();
      });
    });
  });

  describe("getRiskFreeRate.", function () {
    it("without options.", function (done) {
      this.timeout(0);

      yahoo.getRiskFreeRate(undefined, function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.should.be.instanceOf(Number);
        console.log("verify the value to access http://finance.yahoo.com/bonds: ", report);

        done();
      });
    });

    it("with options.", function (done) {
      this.timeout(0);

      var q = [2, 150];

      yahoo.getRiskFreeRate(q[0], function (err, report) {
        should.not.exist(err, "error may require checking connection to re-test. :" + err);
        should.exist(report);
        report.should.be.instanceOf(Number);
        console.log("verify the value over " + q[0] + " month to access http://finance.yahoo.com/bonds: ", report);

        // more test
        yahoo.getRiskFreeRate(q[1], function (err, report) {
          should.not.exist(err, "error may require checking connection to re-test. :" + err);
          should.exist(report);
          report.should.be.instanceOf(Number);
          console.log("verify the value over " + q[1] + " month to access http://finance.yahoo.com/bonds: ", report);

          done();
        });
      });
    });
  });
});
