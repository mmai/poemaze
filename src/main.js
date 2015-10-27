/** @jsx hJSX */

// require("./scss/main.scss")

import {run, Rx} from '@cycle/core';
import {makeDOMDriver, hJSX, h} from '@cycle/dom';
import {makeClientDriver} from 'cycle-director';

let arbreIntegralData = []; 

let routes = [
  { url: "/dashboard/", on: () => viewDashboard(), name: 'Dashboard' },
  { url: '/', on: () => viewHome(), name: 'Home' }
];

let viewHome = () => {
  console.log(arbreIntegralData[0]);
  return  (
      <h3> AI </h3>
  )
}

function pageId(ev){
  return "o";
}

function render(output){
  return (
    <div id="maincontainer">
      {output}
    </div>
    );
}

function intent(DOM) {
  return {
    wordClick$: DOM.select('a').events('click')
  };
}

function model({wordClick$}){
  return Rx.Observable.merge(
    wordClick$.map(  ev => pageId()),
  ).startWith(0);
}

function view(state$, output){
  return state$.map((state) => {
      return render(output);
    });
}

function main({DOM, Router}) {
  let route$ = Rx.Observable.from(routes);
  let state$ = model(intent(DOM));

  let view$ = Router.map(
    (output) => view(state$, output)
  );

  return {
    DOM: view$,
    Router: route$
  }
}

let drivers = {
  DOM: makeDOMDriver('#page'),
  Router: makeClientDriver({
    html5history: false,
    notfound: () => { return "Page non trouvée" }
  })
};

fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
    // console.log('parsed json', json)
    arbreIntegralData = json;
    run(main, drivers);
  }).catch(function(ex) {
    console.log('parsing failed', ex)
  }); 
