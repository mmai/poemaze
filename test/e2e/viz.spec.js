casper.test.begin('Display mini viz on wordpress pages', 2, function suite(test) {
    casper.start('http://arbre-integral.net/forums/', function(){
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
    casper.thenOpen('http://arbre-integral.net:1234/', function (){
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

casper.test.begin('Keep poem navigation history on wordpress pages', 8,  function suite(test) {
    casper.thenOpen('http://arbre-integral.net/forums/')
    .waitForSelector('#maincontainer')
    .then(function() { this.click('a.dashboardLink'); })
    .waitForSelector('#maincontainer', function(){
        test.assertElementCount("#history li", 0, "history has no entry");
        test.assertVisible('.viz-neighbor', 'dashboard neighbors are visible')
        this.click('.viz-neighbor');
      })
    .then(function() { this.click('a.dashboardLink'); })
    .then(function(){
        test.assertVisible('#history', 'dashboard history is visible')
        test.assertElementCount("#history li", 1, "history has one entry on forum page");
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
        // test.assertVisible('.ai-word--up', 'dashboard history is not empty')
        test.assertElementCount("#history li", 1, "history has one entries on internal forum page");
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


