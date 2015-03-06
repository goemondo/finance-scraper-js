# finance-scraper-js

This software is released under the MIT License, see LICENSE.
This module can get symbols being listed on NASDAQ and their fundamentals.

## Installation

To install with [npm](http://github.com/isaacs/npm):

    npm install finance-scraper-js

Current version is tested with node v0.10.33.

## Features

+ get enterprise list belonging to NASDAQ, NYSE and AMEX, including their name, symbol, industry, IPO year and so on, from nasdaq.

+ get fundamentals, key statistics and quotes of designated enterprise symbol from yahoo! finance.

## How to use

### nasdaq

```javascript
// nasdaq
var nasdaq = require("finance-scraper-js").nasdaq;

// get enterprise list containing symbol, name, market cap and so on.
// callback function can have your own arguments.
nasdaq(undefined, function (error, list, last, ...) {
  // error is instance of Error, list is array of array/dictionaly containing enterprise info.
  if (!err) {
    // do with list
    // list is formatted with like [["symbol", "name", "marketcap", ...], ["AAPL", "apple ltd.", '$966.85M', ...], ...].
  }
  // this function is called in 26 times,
  // in each time of which list with alphabet from A to Z in front of symbol are returned.
  // so in last time, "last" will be set to true.
  // when you wanna get lists in one time, you can use nasdaq.getCompaniesList.
  if (last) {
    // to finalize
  }
});

// call with option
// callback function can have your own arguments.
nasdaq({
  // if "aarray" is set to format propertt, list is array of dictionaly like
  // [{"symbol": "AAPL", "name": "apple ltd.", "marketcap": '$966.85M', ...}, {...}, ...].
  format: "aarray"
}, function (error, list, last, ...) {
  // ...
});

// compatibile function with the same feature.
// callback function can have your own arguments.
nasdaq.getCompaniesList(function (error, list, ...) {
  // list formatted with "aarray" containing all alphabet from a to z.
});
```

```javascript
// yahoo
var yahoo = require("finance-scraper-js").yahoo;

/*
 * get valid symbol
 */
yahoo.getValidSymbol(["AAPL", "AAPL-P", "AAPL-WT", "AAPL-WI"], function (error, validSymbol) {
  if (!error) {
    // validSymbol is "AAPL".
  }
});

/*
 * get fundamentals (cash flow, income statement, balance sheet).
 */
// option can be set to either undefined or object with "format" property.
// see "methods" section in details.
var option = undefined || {
  // row-oriented or "column-oriented" or "associative" array. see "method" in details.
  format: "rarray" || "carray" || "aarray"
};

// callback function can have your own arguments.
yahoo.getFundamentals("Cash Flow" || "Income Statement" || "Balance Sheet", "AAPL", "annual" || "quarter", option, function (error, report, ...) {
  if (!error) {
    // do with report
  }
});

/*
 * get yahoo's key statistics.
 */
// option can be set to either undefined or object with "format" and "toNumber" properties.
// see "methods" section in details.
option = undefined || {
  // row-oriented or "column-oriented" or "associative" array. see "method" in details.
  format: "rarray" || "carray" || "aarray",
  // transform values from string to number as possible
  toNumber: true || false
};

// callback function can have your own arguments.
yahoo.getKeyStatistics("AAPL", option, function (error, report, ...) {
  if (!error) {
    // do with report
  }
});

/*
 * get historical quotes.
 */
// option can be set to either undefined or object with "interval", "begin", "end", "term", "format" and "toNumber" properties.
// see "methods" section in details.
option = undefined || {
  // dayly, weekly, monthly, quarterly
  interval: undefined || "d" || "w" || "m" || "q",
  // start date of acqusition period
  begin: undefined || Date,
  // end date of acqusition period
  end: undefined || Date,
  // term from as far back as "end" [ms]
  term: undefined || Number,
  // row-oriented or "column-oriented" or "associative" array. see "method" in details.
  format: "rarray" || "carray" || "aarray",
  // transform values from string to number as possible
  toNumber: true || false
};

// callback function can have your own arguments.
yahoo.getQuotes("AAPL", option, function (error, report, ...) {
  if (!error) {
    // do with report
  }
});

/*
 * get historical volatility of given symbol.
 */
// option can be set to either undefined or object with "interval", "begin", "end", "term" and "numberOfDay" properties.
// see "methods" section in details.
option = undefined || {
  // dayly, weekly, monthly, quarterly
  interval: undefined || "d" || "w" || "m" || "q",
  // start date of acqusition period
  begin: undefined || Date,
  // end date of acqusition period
  end: undefined || Date,
  // term from as far back as "end" [ms]
  term: undefined || Number,
  // the number of days in year
  numberOfDay: undefined || Number
};

// callback function can have your own arguments.
yahoo.getHV("AAPL", option, function (error, hv, ...) {
  if (!error) {
    // do with histrical volatility
  }
});

/*
 * get risk free rate.
 */
var maturity = 12 * 10; // term with the number of month, which is 12 * 10 for "10 year".
// callback function can have your own arguments.
yahoo.getRiskFreeRate(maturity, function (error, rfr, ...) {
  if (!error) {
    // rfr is Number of risk free rate.
  }
});
```

## Methods

### nasdaq (opt, next)

acquire enterprise list containing its symbol, name, last close price, market cap, ipo year, sector, industry and summary quote.

**opt**
- *Object* optional. opt contains "format" property. "format" can be set to "rarray" or "aarray", each of which means array of arrays and associative array respectively. by default, it is "rarray".

**next**
- *Function* next is callback function. this is called in several time (26 times maximumly) in each time getting a part of list. this has error, enterprise list, flag and your originals in its arguments. the "flag" will be set true in last call.

### nasdaq.getCompaniesList (next)

this is for back compatibility with the same feature.

**next**
- *Function* next is callback function. this is called in one time with all of enterprise. this has error, enterprise list and your originals in its arguments.

### yahoo.getValidSymbol (symbols, next)

get valid symbols which can be used in yahoo.

**symbols**
- *Array* symbols is array including symbol string candidates.

**next**
- *Function* next is callback function. this has error and validSymbolString arguments.

### yahoo.getFundamentals (type, symbol, term, opt, next)

get enterprise fundamentals.

**type**
- *String* type must be set to "Cash Flow", "Income Statement" or "Balance Sheet".

**symbol**
- *String* symbol must be enterprise's symbol string.

**term**
- *String* optional. this could be set to "annual" or "quarter". by default, this is "annual".

**opt**
- *Object* optional. opt can contain "format" property. "format" can be set only "rarray", "carray" and "aarray". "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..]. "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...]. "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...]. by default this is "ctable".

**next**
- *Function* next must be set to the callback function. this has error, report and your originals in its arguments.

### yahoo.getKeyStatistics (symbol, opt, next)

get enterprise key statistics.

**symbol**
- *String* symbol must be enterprise's symbol string.

**opt**
- *Object* optional. opt can contain "format", "toNumber" properties. "format" can be set only "rarray", "carray" and "aarray". "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..]. "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...]. "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...]. by default this is "ctable". note that "aarray" is not suitable for getting this report, because the report has headers with the same name! "toNumber" might be true to return number in that key statistics is string.

**next**
- *Function* next must be set to the callback function. this has error, report and your originals in its arguments.

### yahoo.getQuotes (symbol, opt, next)

get historical quotes.

**symbol**
- *String* symbol must be enterprise's symbol string.

**opt**
- *Object* optional. opt contains "interval", "begin", "end", "term", "format" and "toNumber" properties. "interval" can take "d", "w", "m" or "q". they mean dayly, weekly, monthly or quartely interval of quotes respectively. by default, it is "w". "begin" can take Date object that indicates the top of the date of a period acquired quotes. by default, this is designated by yahoo. "end" can take Date object that indicates the end of the date of a period acquired quotes. by default, this is set to today. "term" can take Number that indicates a length of period of acquired quotes. this is used for calclating "begin" date by subtracting this from "end".getTime(), so this number is set in unit of millisecond. if "begin" is set, "begin" has a much priority than "term". by default, this is 1000 * 60 * 60 * 24 * 365 * 3, which means 3 years. "format" can be set only "rarray", "carray" and "aarray". "rarray" designates output to row-oriented table like [[name0, name1, name2, ...], [date, 1's value, 2's value, ...], ..]. "carray" designates output to column-oriented table like [[name0, date0, date1, ...], [name1, value in date0, ...], ...]. "aarray" designates output to associative array (dictionaly/hash) [{name0: 0's value, name1: 1's value, ...}, {...}, ...]. by default this is "rtable". "toNumber" might be true to return quote value with number not string. by default this is false.

**next**
- *Function* next must be set to the callback function. this has error, report and your originals in its arguments.

### yahoo.getHV (symbol, opt, next)

get historical volatility of given symbol.

**symbol**
- *String* symbol must be enterprise's symbol string.

**opt**
- *Object* optional. opt contains "numberOfDay" and getQuotes option, except for "format" and "toNumber" ("interval", "begin", "end" and "term"). "numberOfDay" means the number of days in year. by default, it is 250.

**next**
- *Function* next must be set to the callback function. this has error, historical volatility number and your originals in its arguments.

### yahoo.getRiskFreeRate (maturity, next)

get risk free rate.

**maturity**
- *Number* optional. maturity can be set by the number of month. by default it's 12 * 10 (10 year).

**next**
- *Function* next must be set to the callback function. this has error, risk free rate number and your originals in its arguments.
