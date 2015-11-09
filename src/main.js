require("./arbreintegral.scss")
import 'whatwg-fetch' // fetch polyfill for older browsers
import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeHistoryDriver, filterLinks } from '@cycle/history';

import {makeAI} from './arbreintegral';
import {makeVizDriver} from './arbreintegralVizDriver';
import {makeLocalStorageSinkDriver, makeLocalStorageSourceDriver} from './localstorageDriver';
import {serialize, deserialize} from './visitedLeafSerializer';
import {renderDashboard, renderLeaf} from './view';

let AI = null; 

function model(state, url){
  if (url.pathname == "reset"){
    return  { pathname: '', currentLeafId: "0", visitedLeafs:{} };
  }

  let newVisited = state.visitedLeafs;
  let curleafid = url.pathname || "0";

  if (!(curleafid in state.visitedLeafs)){
    newVisited[curleafid] = url.from;
    // newVisited[curleafid] = url.from || "0";
  }

  return {
    pathname: url.pathname,
    currentLeafId: curleafid,
    visitedLeafs: newVisited
  };
}

function view(state){
  switch (state.pathname) {
  case 'dashboard':
    return renderDashboard()
  default:
    let leaf = AI.getLeaf(state.currentLeafId);
    if (!leaf) 
      throw new Error(`leaf ${state.currentLeafId} not found`);

    let leafInfos = {
      leaf: leaf,
      type: AI.getType(leaf),
      neighbors: AI.getNeighbors(leaf, {exclude:state.visitedLeafs})
    };
    return renderLeaf(leafInfos);
  }
  return h("div", 'Page non trouvée');
}

function main({DOM, History, Viz, LocalStorageSource}) {
  let nbClicks = 0;
  //DOM => History/Actions
  const clicked$ = DOM
    .select('a')
    .events('click')
    .filter(filterLinks);


  const url$ = Rx.Observable.concat(
    deserialize(LocalStorageSource).flatMap( urlList => Rx.Observable.from(urlList)),
    clicked$ 
      .map(event =>  {
        let [pathname, from] = event.target.hash.slice(1).split('-');
        return {
          pathname: pathname,
          from: from 
        };
      })
  )
  .startWith({pathname:"0", from:"0"})
  .shareReplay()

  const history$ = clicked$.map(event => event.target.href.replace(location.origin, ``));

  const initialState = {pathname: '/', currentLeafId: "0", visitedLeafs:{}};
  const state$ = url$
    .scan(model, initialState)
    .shareReplay();

  //Urls => LocalStorageSink
  const storedUrlList$ = serialize( url$
      .filter(url => (url.pathname == 'reset' || url.from !== undefined))
      .distinctUntilChanged()
      .scan(function(urlList, url){
          if (url.pathname == 'reset') return [];

          urlList.push(url);
          return urlList;
        }, []).share()
  ); 

  //State => DOM
  const view$ = state$.map( view );

  //State => Viz
  const visitedLeaf$ = state$.map(state => {
      let fromId = state.visitedLeafs[state.currentLeafId];
      if (fromId === undefined && state.currentLeafId === "0") fromId = "0";
      return {
        reset: Object.keys(state.visitedLeafs).length < 1,
        leafId: state.currentLeafId,
        fromId: fromId
      };
    })
  .filter(leaf => leaf.fromId !== undefined)
  // .startWith({leafId:"0", fromId:"0"})
  .distinctUntilChanged();

  return {
    DOM: view$,
    History: history$,
    Viz: visitedLeaf$,
    LocalStorageSink: storedUrlList$
  }
}

fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
      AI = makeAI(json);
      let drivers = {
        DOM: makeDOMDriver('#page'),
        History: makeHistoryDriver(),
        Viz: makeVizDriver(AI),
        LocalStorageSource: makeLocalStorageSourceDriver('arbreintegral'),
        LocalStorageSink: makeLocalStorageSinkDriver('arbreintegral')
      };

      run(main, drivers);
  })
