/** @jsx hJSX */

require("./arbreintegral.scss")

import 'whatwg-fetch' // fetch polyfill for older browsers
import {run, Rx} from '@cycle/core';
import {makeDOMDriver, hJSX, h} from '@cycle/dom';
import {makeHistoryDriver, filterLinks } from '@cycle/history';
import {makeAI} from './arbreintegral';
import {VizWidget, makeVizDriver} from './arbreintegralVizDriver';
import {storageAvailable} from './utils';

let AI = null; 
let hasStorage = storageAvailable('localStorage');

function pageId(ev){
  return "o";
}

function renderDashboard(){
  return h('div#maincontainer', [ 
      h('h2', "Tableau de bord"),
      h('a', {href: "/"}, "Lire"),
      // new AiTwoWidget({ width: 285, height: 200 }),
      // new AiTwoWidget(AI, {fullscreen:true})
      // new AiTwoWidget(AI)
    ]
  );
}

function renderLeaf(leafId){
  let leaf = AI.getLeaf(leafId);
  if (!leaf){
    throw new Error(`leaf ${leafId} not found`);
  }

  let circlesView = (id) => {
    switch(AI.getType(leaf)){
    case 'ROOT':
      return renderRoot(leaf);
    case 'DOWN': 
      // setVisitedLeaf(leafId);
      return renderLeafReversed(leaf);
    default: 
      // setVisitedLeaf(leafId);
      return renderLeafUpside(leaf);
    }
  }(leafId);


  return (
    <div id="maincontainer">
      <a href="/dashboard">dashboard</a><br/>
      <a href="/reset">Reset</a><br/>
      <hr />
        {circlesView}
      <hr />
        {new VizWidget()}
    </div>
    );
}

function renderRoot(leaf){
  let neighbors = AI.getNeighbors(leaf, {exclude:visitedLeafs});
  return (
      <div id="ai-text">
        <div className="circle">
          <div id="circle-children--left">
            <a href={neighbors.leftChild.leaf.id + "?from=" + neighbors.leftChild.fromId}>{neighbors.leftChild.leaf.word}</a>
          </div>
        </div>

        <div id="circle-current" className="circle">
          <div id="circle-current--content">
            {leaf.content}
          </div>
        </div>

        <div className="circle">
          <div id="circle-children--right">
            <a href={neighbors.rightChild.leaf.id + "?from=" + neighbors.rightChild.fromId}>{neighbors.rightChild.leaf.word}</a>
          </div>
        </div>
      </div>
      )
}

function renderLeafReversed(leaf){
  return renderLeafUpside(leaf);
}

function renderLeafUpside(leaf){
  let neighbors = AI.getNeighbors(leaf, {exclude:visitedLeafs});
  return (
      <div id="ai-text">
        <div id="circle-children" className="circle">
          <div id="circle-children--left">
            <a href={neighbors.leftChild.leaf.id + "?from=" + neighbors.leftChild.fromId}>{neighbors.leftChild.leaf.word}</a>
          </div>
          <div id="circle-children--right">
            <a href={neighbors.rightChild.leaf.id + "?from=" + neighbors.rightChild.fromId}>{neighbors.rightChild.leaf.word}</a>
          </div>
        </div>

        <div id="circle-current" className="circle">
          <div class="circle-current--left">
            <a href={neighbors.leftBrother.leaf.id + "?from=" + neighbors.leftBrother.fromId}>{neighbors.leftBrother.leaf.word}</a>
          </div>
          <div id="circle-current--content">
            {leaf.word}<br />
            {leaf.content}
          </div>
          <div id="circle-current--right">
            <a href={neighbors.rightBrother.leaf.id + "?from=" + neighbors.rightBrother.fromId}>{neighbors.rightBrother.leaf.word}</a>
          </div>
        </div>

        <div id="circle-parent" className="circle">
            <a href={neighbors.parent.leaf.id + "?from=" + neighbors.parent.fromId}>{neighbors.parent.leaf.word}</a>
        </div>
      </div>
      );
    }

function intent(DOM) {
  return {
    wordClick$: DOM.select('a').events('click')
  };
}

function model(history$){
    history$.map(location => {
        return location.pathname;
    });
}

function main({DOM, History, Viz}) {
   const url$ = DOM
    .select('a')
    .events('click')
    .filter(filterLinks)
    .map(event =>  event.target.pathname + event.target.search);

  let state$ = History.startWith({ pathname: '/' })
    .map(location => {
        let leafId = location.pathname.slice(1);
        if (leafId == ""){
          leafId = '0';
        }
        let fromId = location.search?location.search.slice(6):"0";
        setVisitedLeaf(leafId, fromId);
        return {
          pathname: location.pathname,
          currentLeafId: leafId
        };
    });

  let leafDisplay$ = state$
    .map(state => {
      return {
        leafId: state.currentLeafId,
        fromId: visitedLeafs[state.currentLeafId] || "0"
      }
    });

  let view$ = state$
    .map(state => {
      switch (state.pathname) {
        case '/dashboard':
          return renderDashboard()
        case '/reset':
          reset();
          return renderLeaf("0")
        default:
          return renderLeaf(state.currentLeafId)
      }
    });

  return {
    DOM: view$,
    History: url$,
    Viz: leafDisplay$
  }
}

//visitedLeafs: implemented as a Set with an object.
let visitedLeafs = {};
if (hasStorage){
  let json = localStorage.getItem("visitedLeafs");
  visitedLeafs = JSON.parse(json) || visitedLeafs;
}

function reset(){
  visitedLeafs = {};
  if (hasStorage){
    localStorage.setItem("visitedLeafs", JSON.stringify(visitedLeafs));
  }
}

function setVisitedLeaf(id, from){
  if (!(id in visitedLeafs)){
    visitedLeafs[id] = from || true;
    if (hasStorage){
      localStorage.setItem("visitedLeafs", JSON.stringify(visitedLeafs));
    }
  }
}

fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
      AI = makeAI(json);
      let drivers = {
        DOM: makeDOMDriver('#page'),
        Viz: makeVizDriver(AI),
        History: makeHistoryDriver()
      };

      run(main, drivers);
  })
// .catch(function(ex) {
//       console.log('parsing failed', ex)
//   }); 
