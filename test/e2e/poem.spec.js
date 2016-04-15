// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  baseUrl: 'http://localhost:8080',
}
var baseUrl = settings.baseUrl;

casper.test.begin('Display poem', 1,  function suite(test) {
    casper.start(baseUrl)
    .waitForSelector('a.ai-up')
    .then(function() {
        this.click('a.ai-up');
      })
    .waitForSelector('#side-panel', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        this.click("ul li button");
      })
    .waitForSelector('#historyList', function(){
        this.click("#historyList li a");
      })
    .waitForSelector('.dashboardLink', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        // test.assertElementCount(".ai-text > .circle", 3, "poem is made of 3 circles divs");
        test.assertElementCount(".navigate-content", 1, "poem is displayed");
      })
    .then(function(){
        this.evaluate(function() { localStorage.clear(); }, {});
      })
    .run(function(){
          test.done()
        })

  })

// casper.options.waitTimeout = 20000;
casper.on('remote.message', function(message) {
    this.echo('---- CONSOLE LOG --- : ' + message);
});

//Needed with phantomjs 1.x
casper.on( 'page.initialized', function(){
    this.evaluate(function(){
        var isFunction = function(o) {
          return typeof o == 'function';
        };

        var bind,
          slice = [].slice,
          proto = Function.prototype,
          featureMap;

        featureMap = {
          'function-bind': 'bind'
        };

        function has(feature) {
          var prop = featureMap[feature];
          return isFunction(proto[prop]);
        }

        // check for missing features
        if (!has('function-bind')) {
          // adapted from Mozilla Developer Network example at
          // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
          bind = function bind(obj) {
            var args = slice.call(arguments, 1),
              self = this,
              nop = function() {
              },
              bound = function() {
                return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
              };
            nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
            bound.prototype = new nop();
            return bound;
          };
          proto.bind = bind;
        }
    });
});


