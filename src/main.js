/** @jsx hJSX */

require("./arbreintegral.scss")

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

  let circlesView = (id) => {
    switch(AI.getType(leaf)){
    case 'ROOT':
      return renderRoot(leaf);
    case 'DOWN': 
      return renderLeafReversed(leaf);
    default: 
      return renderLeafUpside(leaf);
    }
  }(leafId);

  return (
    <div id="maincontainer">
      <a href="/dashboard">dashboard</a><br/>
      <hr />

        {circlesView}

    </div>
    );
}

function renderRoot(leaf){
  let neighbors = AI.getNeighbors(leaf);
  return (
      <div id="ai-text">
        <div className="circle">
          <div id="circle-children--left">
            <a href={neighbors.leftChild.id}>{neighbors.leftChild.word}</a>
          </div>
        </div>

        <div id="circle-current" className="circle">
          <div id="circle-current--content">
            {leaf.content}
          </div>
        </div>

        <div className="circle">
          <div id="circle-children--right">
            <a href={neighbors.rightChild.id}>{neighbors.rightChild.word}</a>
          </div>
        </div>
      </div>
      )
}

function renderLeafReversed(leaf){
  return renderLeafUpside(leaf);
}

function renderLeafUpside(leaf){
  let neighbors = AI.getNeighbors(leaf);
  return (
      <div id="ai-text">
        <div id="circle-children" className="circle">
          <div id="circle-children--left">
            <a href={neighbors.leftChild.id}>{neighbors.leftChild.word}</a>
          </div>
          <div id="circle-children--right">
            <a href={neighbors.rightChild.id}>{neighbors.rightChild.word}</a>
          </div>
        </div>

        <div id="circle-current" className="circle">
          <div class="circle-current--left">
            <a href={neighbors.leftBrother.id}>{neighbors.leftBrother.word}</a>
          </div>
          <div id="circle-current--content">
            {leaf.content}
          </div>
          <div id="circle-current--right">
            <a href={neighbors.rightBrother.id}>{neighbors.rightBrother.word}</a>
          </div>
        </div>

        <div id="circle-parent" className="circle">
            <a href={neighbors.parent.id}>{neighbors.parent.word}</a>
        </div>
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
