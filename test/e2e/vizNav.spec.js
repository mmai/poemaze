// var settings = require('../../src/settings.dev');//aargh es6 modules
var settings = {
  // baseUrl: 'http://arbre-integral.net',
  // pagesUrl: 'http://arbre-integral.net'
  baseUrl: 'http://localhost:1234',
  pagesUrl: 'http://localhost:1234/testpages'
}

casper.test.begin('Draw SVG paths', 17, function suite(test){
    casper.start(settings.baseUrl)
    .then(function(){
        this.evaluate(function() { localStorage.clear(); }, {});
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.ai-up', function() {
        test.assertElementCount("a[href^='00?']", 4, 'home page has 4 links towards leaf of id 00')
      })

    casper = followPath.bind(casper)(["00", "01", "011"])
    .then(function(){
        test.assertElementCount('a.dashboardLink svg g path,a.dashboardLink svg g line', 3 + 1, 'logo visualization SVG has 3 steps') //One more for the init step, discarded after subsequent reloads
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.dashboardLink', function() {
        test.assertEval(lastVizStepVisible, 'last step viz is visible')
      })
    
    casper = showHistory.bind(casper)()
    .then(function(){
        test.assertElementCount("#historyList li", 3, "history has 3 entries")
        this.click(`a[href='/01']`)
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.dashboardLink', function() {
        test.assertElementCount('a.dashboardLink svg g path,a.dashboardLink svg g line', 3 , 'logo visualization SVG has 3 steps after history click')
        test.assertEval(lastVizStepVisible, 'last step viz is visible after reloading')
      })

    //Animation after reset
    casper.then(function(){
        this.evaluate(function() { localStorage.clear(); }, {});
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.ai-up')
    casper = followPath.bind(casper)(["01", "00", "010", "0100"])
    .then(function(){
        test.assertElementCount('a.dashboardLink svg g path,a.dashboardLink svg g line', 4 + 1, 'logo visualization SVG has 4 steps') //One more for the init step, discarded after subsequent reloads
      })
    .then(function() { this.click('a.dashboardLink'); })
    .wait(2000)
    .then(function(){
        test.assertElementCount('.side-panel-content svg g path,.side-panel-content svg g line', 4 + 1, 'main visualization SVG has 4 steps') //One more for the init step, discarded after subsequent reloads
        this.click(`a[href='/reset']`)
      })
    // .thenOpen(settings.baseUrl)
    .waitForSelector('.ai-up')
    casper = followPath.bind(casper)(["01", "00", "010", "0100"])
    .then(function() { this.click('a.dashboardLink'); })
    .wait(2000)
    .then(function(){
        test.assertElementCount('.side-panel-content svg g path,.side-panel-content svg g line', 4 + 1, 'main visualization SVG has 4 steps after reset')
        this.click(`a[href='/reset']`)
      })
    .waitForSelector('.ai-up')
    casper = followPath.bind(casper)(["01", "00", "010", "0100"])
    .then(function() { this.click('a.dashboardLink'); })
    .wait(2000)
    .then(function(){
        //Don't remove this test: there really was a bug which made fail this one but not the prevous 
        test.assertElementCount('.side-panel-content svg g path,.side-panel-content svg g line', 4 +1, 'main visualization SVG has 4 steps after 2nd reset') 
      })

    //Oblique
    casper.then(function(){
        this.evaluate(function() { localStorage.clear(); }, {});
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.ai-up')
    casper = followPath.bind(casper)(["00", "01", "010", "011"])
    .then(function(){
        test.assertElementCount('a.dashboardLink svg g path,a.dashboardLink svg g line', 4 + 1, 'logo visualization SVG has 4 steps') //One more for the init step, discarded after subsequent reloads
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.dashboardLink', function() {
        test.assertEvalEqual(lastVizStepType, 'circle', 'last step viz is an arc circle')
      })
    
    casper = showHistory.bind(casper)()
    .then(function(){
        test.assertElementCount("#historyList li", 4, "history has 4 entries")
        test.assertElementCount('.side-panel-content svg g path,a.dashboardLink svg g line', 4 + 1, 'main visualization SVG has 4 steps') //One more for the init step, discarded after subsequent reloads
        this.click(`a[href='/00']`)
      })
    .thenOpen(settings.baseUrl)
    .waitForSelector('.dashboardLink', function() {
        test.assertElementCount('a.dashboardLink svg g path,a.dashboardLink svg g line', 4 , 'logo visualization SVG has 4 steps after history click')
        test.assertEval(vizStepsEndDifferents, 'last step end differs from history step end', [1, 4])
        test.assertEvalEqual(lastVizStepType, 'circle', 'last step viz is an arc circle')
      })
    .then(function(){
        this.evaluate(function() { localStorage.clear(); }, {});
      })
    .run(function(){
        test.done()
      })
})

function followPath(path){
  return path.reduce(
    function (casp, leaf) {
      return casp.waitForSelector('#ai-page', function(){
        this.click(`a[href^='${leaf}?']`)
      })
    }, this)
}

function showHistory(){
  return this
    .then(function() { this.click('a.dashboardLink'); })
    .then(function() { this.click("ul li button") })
}

function lastVizStepVisible(){
  var elements = __utils__.findAll('a.dashboardLink svg g path,a.dashboardLink svg g line');
  var lastElem = elements[elements.length - 1]
  return lastElem.getAttribute('x1') - lastElem.getAttribute('x2') !== 0;
}

function vizStepsEndDifferents(s1, s2){
  var elements = __utils__.findAll('a.dashboardLink svg g path,a.dashboardLink svg g line');
  var step1Elem = elements[s1 - 1];
  var step2Elem = elements[s2 - 1];
  // console.log(step2Elem.nodeName);
  if (step1Elem.nodeName === 'path' || step2Elem.nodeName === 'path') return true;
  return (step1Elem.getAttribute('x1') !== step2Elem.getAttribute('x1')) &&
  (step1Elem.getAttribute('x2') !== step2Elem.getAttribute('x2'));
}

function lastVizStepType(){
  var stepType = undefined; 
  var elements = __utils__.findAll('a.dashboardLink svg g path,a.dashboardLink svg g line');
  var lastElem = elements[elements.length - 1]
  if (lastElem.nodeName === "line") {
    stepType = "line";
  } else if (lastElem.nodeName === "path") {
    stepType = "circle";
  }
  return stepType;
}


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


