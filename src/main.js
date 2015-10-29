/** @jsx hJSX */

// require("./scss/main.scss")

import 'whatwg-fetch' // fetch polyfill for older browsers
import {run, Rx} from '@cycle/core';
import {makeDOMDriver, hJSX, h} from '@cycle/dom';
import { makeHistoryDriver, filterLinks } from '@cycle/history';
import {makeAI} from './arbreintegral';

function pageId(ev){
  return "o";
}

function renderDashboard(){
  return (
    <div id="maincontainer">
     <h2>dashboard</h2>
    <a href="/">Lire</a>
    </div>
    );
}

function renderLeaf(pathname){
  let leafId = pathname.slice(1);
  if (leafId == ""){
    leafId = '0';
  }
  let leaf = AI.getLeaf(leafId);
  let neighbors = AI.getNeighbors(leaf);

  return (
    <div id="maincontainer">
    {leaf.id} ({leaf.word})
    <div>{leaf.content}</div>

    <ul>
    <li> leftChild : {neighbors.leftChild.id} ({neighbors.leftChild.word})</li>
    <li> rightChild : {neighbors.rightChild.id} ({neighbors.rightChild.word})</li>
    <li> leftBrother : {neighbors.leftBrother.id} ({neighbors.leftBrother.word})</li>
    <li> rightBrother : {neighbors.rightBrother.id} ({neighbors.rightBrother.word})</li>
    <li> parent : {neighbors.parent.id} ({neighbors.parent.word})</li>
    </ul>

    <a href="/dashboard">dashboard</a><br/>
    <a href="0.1">0.1</a><br/>
    <a href="0.2.2">0.2.2</a><br/>
    <a href="/"></a>
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

function main({DOM, History}) {
   const url$ = DOM
    .select('a')
    .events('click')
    .filter(filterLinks)
    .map(event => event.target.pathname);

  // let state$ = model(intent(DOM));

  let view$ = History
    .startWith({ pathname: '/' })
    .map(location => {
      switch (location.pathname) {
        case '/dashboard':
          return renderDashboard()
        default:
          return renderLeaf(location.pathname)
      }
    });

  return {
    DOM: view$,
    History: url$
  }
}

let drivers = {
  DOM: makeDOMDriver('#page'),
  History: makeHistoryDriver()
};

let AI = null; 
fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
      AI = makeAI(json);
      run(main, drivers);
  }).catch(function(ex) {
      console.log('parsing failed', ex)
  }); 
