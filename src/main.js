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
import {progressionComponent} from './progressionComponent';

let AI = null; 

function model(state, url){
  if (url.pathname == "reset"){
    return  { pathname: '', currentLeafId: "0", visitedLeafs:{} };
  }


  let newVisited = state.visitedLeafs;
  let curleafid = url.pathname || "0";

  if (!(curleafid in state.visitedLeafs)){
    newVisited[curleafid] = url.from;
  }

  return {
    pathname: url.pathname,
    currentLeafId: curleafid,
    visitedLeafs: newVisited
  };
}

// function view(state){
function view({state, urlList}){
  switch (state.pathname) {
  case 'dashboard':
    return renderDashboard()
  default:
    let history = [];
    for (let i in urlList) {
      history.push(AI.getLeaf(urlList[i]));
    }
    
    return renderLeaf(state.leafInfos, history);
  }
  return h("div", 'Page non trouvée');
}

function main({DOM, Viz, LocalStorageSource}) {
// function main({DOM, History, Viz, LocalStorageSource}) {
  //DOM => History/Actions
  const clicked$ = DOM
    .select('a')
    .events('click')
    .filter(filterLinks);
    // .map(e => e.target).share();

  const navigationClick$ = clicked$
    .map(event =>  {
        let [pathname, from] = event.target.hash.slice(1).split('-');
        return {
          pathname: pathname,
          from: from 
        };
      });

  // Viz.subscribe(neighborsIds => {
  //     console.log('received neiborsIds');
  //     console.log(neighborsIds);
  //     
  //   }
  // );

  // Clicks on the SVG nodes
  const svgClick$ = DOM
    // .select('.viz-neighbor')
    .select('svg')
    .events('click')
    .map(ev => { return ev.target.getAttribute('data-neighbor-href')})
    .filter(href => href != null) 
    .map(href => {
        let [pathname, from] = href.split('-');
        return {
          pathname: pathname,
          from: from
        }
      });

  const url$ = Rx.Observable.concat(
    deserialize(LocalStorageSource).flatMap( urlList => Rx.Observable.from(urlList)),
    // navigationClick$
    Rx.Observable.merge(navigationClick$, svgClick$)
  )
  .startWith({pathname:"0", from:"0"})
  .shareReplay()

  // const history$ = clicked$.map(event => event.target.href.replace(location.origin, ``));

  const initialState = {pathname: '/', currentLeafId: "0", visitedLeafs:{}};
  const state$ = url$
    .scan(model, initialState)
    .map(state => {
        let newState = state;
        let leaf = AI.getLeaf(state.currentLeafId);
        newState.leafInfos = {
          leaf: leaf,
          type: AI.getType(leaf),
          neighbors: AI.getNeighbors(leaf, {exclude:state.visitedLeafs})
        };
        return state;
      })
    // .combineLatest(Viz, function(state, neighborsIds){
    //     let newState = state;
    //     newState.neighborsIds = neighborsIds;
    //     return newState;
    //   })
    .shareReplay()
    .distinctUntilChanged();

  //Urls => LocalStorageSink
  const storedUrlList$ = serialize( url$
    .filter(url => ( url.pathname == 'reset' || url.from !== undefined))
      .distinctUntilChanged()
      .scan(function(urlList, url){
          if (url.pathname == 'reset') return [];

          urlList.push(url);
          return urlList;
        }, []).share()
  ); 

  //State => DOM
  // const view$ = state$.map( view );
  const view$ = state$.combineLatest(storedUrlList$, 
    function (state, urlList){
      return {
        state: state,
        urlList: JSON.parse(urlList).map(url => url.pathname).filter(pathname => pathname !="0")
      };
    }).map( view );

  //State => Viz
  const visitedLeaf$ = state$.map(state => {
      let fromId = state.visitedLeafs[state.currentLeafId];
      if (fromId === undefined && state.currentLeafId === "0") fromId = "0";
      return {
        reset: Object.keys(state.visitedLeafs).length < 1,
        leaf: state.leafInfos.leaf,
        neighbors: state.leafInfos.neighbors,
        fromId: fromId
      };
    })
  .filter(leaf => leaf.fromId !== undefined)
  .distinctUntilChanged();

  return {
    DOM: view$,
    // History: history$,
    Viz: visitedLeaf$,
    LocalStorageSink: storedUrlList$
  }
}

fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
      AI = makeAI(json);
      let drivers = {
        DOM: makeDOMDriver('#page', {'ai-progression':progressionComponent}),
        // History: makeHistoryDriver(),
        Viz: makeVizDriver(AI),
        LocalStorageSource: makeLocalStorageSourceDriver('arbreintegral'),
        LocalStorageSink: makeLocalStorageSinkDriver('arbreintegral')
      };

      run(main, drivers);
  })
