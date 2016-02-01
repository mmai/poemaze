// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  baseUrl: 'http://localhost:1234',
  pagesUrl: 'http://localhost:1234/testpages'
}

casper.test.begin('Display mini viz on wordpress pages', 2, function suite(test) {
    casper.start(pagesUrl + '/forums', function(){
        test.assertExists('#ai-page', 'html container is found')
      })
    .waitForSelector('#maincontainer', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed')
      })
    .run(function(){
          test.done()
        })

  })

casper.test.begin('Display mini viz on poem pages', 3,  function suite(test) {
    casper.thenOpen(baseUrl, function(){
        test.assertExists('#ai-page', 'html container is found on the home page')
      })
    .waitForSelector('#maincontainer', function(){
        test.assertNotExists('.dashboardLink', 'dashboardLink is not displayed on the home page')
      })
    .then(function() {
        this.click('a.ai-seed-up');
      })
    .waitForSelector('#maincontainer', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed on poem pages')
      })
    .run(function(){
        test.done()
      })
})

casper.test.begin('Display main viz on wordpress pages', 3, function suite(test) {
    casper.thenOpen(pagesUrl + '/forums', function(){
        test.assertExists('#ai-page', 'html container is found')
      })
    .waitForSelector('#maincontainer', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        test.assertElementCount("#history li", 1, "history has one entry");
        this.click("#history li a");
      })
    .waitForSelector('#maincontainer', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        test.assertElementCount("svg", 2, "the two visualization are enabled");
      })
    .run(function(){
          test.done()
        })

  })

casper.test.begin('Keep poem navigation history on wordpress pages', 8,  function suite(test) {
    casper.thenOpen(pagesUrl + '/forums')
    .waitForSelector('#maincontainer')
    .then(function() { this.click('a.dashboardLink'); })
    // .waitUntilVisible('.viz-neighbor', function(){
    .wait(300, function(){
        // test.assertVisible('.viz-neighbor', 'svg neighbors are visible')
        // console.log("found neighbors : " + this.evaluate(() => __utils__.findAll('.viz-neigbhor').length))
        test.assertElementCount("#history li", 1, "history has one entry");
        this.click('.viz-neighbor');
      })
    .then(function() { this.click('a.dashboardLink'); })
    .then(function(){
        test.assertVisible('#history', 'dashboard history is visible')
        test.assertElementCount("#history li", 2, "history has two entries on forum page");
      })
    .then(function() {
        this.click('a[rel~="external"]');
      })
    .waitForSelector('#maincontainer', function(){
        test.assertUrlMatch(/forums\/forum\/.+/, 'current page is a specific forum page');
        this.click('a.bbp-topic-permalink');
      })
    .waitForSelector('#maincontainer', function(){
        test.assertUrlMatch(/forums\/topic\/.+/, 'current page is a topic forum page');
      })
    .waitForSelector('#maincontainer', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed on internal forum pages')
        this.click('a.dashboardLink');
      })
    .then(function(){
        test.assertElementCount("#history li", 2, "history has two entries on internal forum page");
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


