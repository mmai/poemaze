// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  // baseUrl: 'http://arbre-integral.net',
  // pagesUrl: 'http://arbre-integral.net'
  baseUrl: 'http://localhost:1234',
  pagesUrl: 'http://localhost:1234/testpages'
}

casper.test.begin('Display mini viz on wordpress pages', 2, function suite(test) {
    casper.start(settings.pagesUrl + '/forums/index.html', function(){
        test.assertExists('#app', 'html container is found')
      })
    .waitForSelector('.dashboardLink', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed')
      })
    .run(function(){
          test.done()
        })

  })

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

casper.test.begin('Display main viz on wordpress pages', 3, function suite(test) {
    casper.thenOpen(settings.pagesUrl + '/forums/index.html', function(){
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

casper.test.begin('Keep poem navigation history on wordpress pages', 7,  function suite(test) {
    casper.thenOpen(settings.pagesUrl + '/forums/index.html')
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
        test.assertElementCount("#historyList li", 2, "history has two entries on forum page");
      })
    .then(function() {
        this.click('a[rel~="external"]');
      })
    .waitForSelector('#ai-page', function(){
        test.assertUrlMatch(/forums\/forum\/.+/, 'current page is a specific forum page');
      })
    .thenOpen(settings.pagesUrl + '/forums/forum/suggestions/index.html', function(){//XXX needed for webpack-dev-server tests (index.html not recognized on folders)
        this.click('a.bbp-topic-permalink');
      })
    .waitForSelector('#ai-page', function(){
        test.assertUrlMatch(/forums\/topic\/.+/, 'current page is a topic forum page');
      })
    .thenOpen(settings.pagesUrl + '/forums/topic/test/index.html', function(){//XXX needed for webpack-dev-server tests (index.html not recognized on folders)
      })
    .waitForSelector('a.dashboardLink', function(){
        test.assertVisible('.dashboardLink', 'dashboardLink is displayed on internal forum pages')
        this.click('a.dashboardLink');
      })
    .then(function(){
        test.assertElementCount("#historyList li", 2, "history has two entries on internal forum page");
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


