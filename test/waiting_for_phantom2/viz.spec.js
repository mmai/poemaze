describe('Display mini viz on wordpress pages', function() {
  before(function() {
    casper.start('http://arbre-integral.net/forums/')
  })

  it('should display the mini viz', function() {
    casper.then(function() {
        assert('#ai-page').to.be.inDOM
      // '#ai-page'.should.be.inDOM
    })

    casper.waitForSelector('#maincontainer', function(){
      '.dashboardLink'.should.be.inDOM.and.be.visible
    })
  })
})

describe('Display mini viz on poem pages', function() {
  before(function() {
    casper.open('http://arbre-integral.net:1234/')
  })

  it('should not display the mini viz on the home page', function() {
    casper.then(function() {
      '#ai-page'.should.be.inDOM.and.be.visible
    })

    casper.waitForSelector('#maincontainer', function(){
      '.dashboardLink'.should.not.be.inDOM
    })
  })

  it('should display the mini viz when poem navigation has begun', function() {
    casper.then(function() {
        this.click('a.ai-seed-up');
      });

    casper.then(function(){
        this.waitForSelector('#maincontainer', function(){
            '.dashboardLink'.should.be.inDOM.and.be.visible
          })
      })
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

