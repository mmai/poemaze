// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  baseUrl: 'http://localhost:8080',
}

casper.test.begin('Display mini viz on poem pages', 3,  function suite(test) {
    casper.thenOpen(settings.baseUrl, function(){
        test.assertExists('#app', 'html container is found on the home page')
      })
    .waitForSelector('a.ai-up', function(){
        test.assertNotExists('.dashboardLink', 'dashboardLink is not displayed on the home page')
        this.click('a.ai-up');
      })
    .waitForSelector('#ai-page', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed on poem pages')
      })
    .run(function(){
        test.done()
      })
})

casper.test.begin('Display main viz', 3, function suite(test) {
    casper.thenOpen(settings.baseUrl, function(){
        test.assertExists('#app', 'html container is found')
      })
    .waitForSelector('#ai-page', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        this.click("ul li button");
      })
    .waitForSelector('#historyList', function(){
        test.assertElementCount("#historyList li", 1, "history has one entry");
        this.click("#historyList li a");
      })
    .waitForSelector('.dashboardLink', function(){
        this.click('a.dashboardLink');
      })
    .waitForSelector('svg', function(){
        test.assertElementCount("svg > g", 4, "the two visualizations are enabled");
      })
    .run(function(){
          test.done()
        })

    });

casper.test.begin('Keep poem navigation history', 3,  function suite(test) {
    casper.thenOpen(settings.baseUrl)
    // .waitForSelector('a.dashboardLink')
    .waitForSelector('#ai-page')
    .then(function() {
        test.assertNotVisible('#side-panel.active', 'dashboard is closed')
        this.click('a.dashboardLink');
      })
    .then(function() {
        this.click("ul li button");
      })
    .waitForSelector('#historyList', function(){
        test.assertElementCount("#historyList li", 1, "history has one entry");
        this.click('.viz-neighbor');
      })
    .waitForSelector('a.dashboardLink', function(){ this.click('a.dashboardLink'); })
    .waitForSelector('ul li button', function(){ this.click("ul li button"); })
    .waitForSelector('#historyList', function(){
        test.assertElementCount("#historyList li", 2, "history has two entries");
      })
    .run(function(){
        test.done()
      })
  });

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


