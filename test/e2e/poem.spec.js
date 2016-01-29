// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  baseUrl: 'http://localhost:1234',
  pagesUrl: 'http://localhost:1234/testpages'
}
var baseUrl = settings.baseUrl;
var pagesUrl = settings.pagesUrl;

casper.test.begin('Display poem after navigating wordpress pages', 1,  function suite(test) {
    casper.start(baseUrl)
    .waitForSelector('#maincontainer')
    .then(function() {
        this.click('a.ai-seed-up');
      })
    .thenOpen(pagesUrl + '/forums')
    .waitForSelector('#maincontainer', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        this.click("#history li a");
      })
    .waitForSelector('#maincontainer', function(){
        this.click('a.dashboardLink');
      })
    .then(function() {
        test.assertElementCount(".ai-text > .circle", 3, "poem is made of 3 circles divs");
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


