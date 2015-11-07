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

// import makeTimeTravel from 'cycle-time-travel';

let AI = null; 

// (state, url) -> state
function model(state, url){
  if (url.pathname == "reset"){
    return  { pathname: '', currentLeafId: "0", visitedLeafs:{} };
  }

  //Leaf
  if (url.from){
    const fromId = url.from || "0";
    const leafId = url.pathname || "0";
    state.currentLeafId = leafId;
    if (!(leafId in state.visitedLeafs)){
      state.visitedLeafs[leafId] = fromId;
    }
  }

  state.pathname = url.pathname;
  console.log(state);
  return state;
}

function view(state){
  switch (state.pathname) {
  case '/dashboard':
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

// function main({DOM, History, Viz, LocalStorageSource}) {
let nbClicks = 0;
function main({DOM, Viz, LocalStorageSource}) {
  //DOM => History/Actions
  let clicked$ = DOM
    .select('a')
    .events('mouseup')
    .filter(filterLinks);
  let url$ = clicked$
    .map(event =>  {
        nbClicks +=1;
        console.log(`clicked ${nbClicks}`);
        let [pathname, from] = event.target.hash.slice(1).split('-');
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        // nbClicks +=1;
        // console.log(`clicked ${nbClicks}`);
        return {
          pathname: pathname,
          from: from 
        };
      }).startWith({pathname:"0", from:"0"});
  // const history$ = clicked$.map(event => event.target.href.replace(location.origin, ``));

  //LocalStorageSource & History/Actions => State
  // const state$ = deserialize(LocalStorageSource)
  // .flatMap( function(initialState){
  //     return url$.scan(model, initialState);
  //   }
  // )
  // .startWith({pathname: '/', currentLeafId: "0", visitedLeafs:{}});

  //XXX test without localstorage source
  let initialState = {pathname: '', currentLeafId: "0", visitedLeafs:{}};
  // let state$ = url$.scan(model, initialState);
  let state$ = url$.map(url => initialState);

  //State => Viz
  let visitedLeaf$ = state$
    .map(state => {
        return {
          leafId: state.currentLeafId,
          fromId: state.visitedLeafs[state.currentLeafId] || "0"
        }
      })
    .distinctUntilChanged();

  //State => LocalStorageSink
  let storedState$ = serialize(state$)

  //State => DOM
  const view$ = state$.map(view);

  //Time travel debugging
  // let {DOM: timeTravelBar$, timeTravel} = makeTimeTravel(DOM, [
  //     {stream: url$, label: 'url$' },
  //     // {stream: history$, label: 'history$' },
  //     {stream: state$, label: 'state$' },
  //     {stream: visitedLeaf$, label: 'visitedLeaf$'}
  //   ]);  
  // const view$ = Rx.Observable.combineLatest(
  //     timeTravel.state$,
  //     timeTravelBar$,
  //     (state, timeTravelBar) => h('.debug', [ view(state), timeTravelBar ])
  //   );

  return {
    DOM: view$,
    // History: history$,
    Viz: visitedLeaf$,
    LocalStorageSink: storedState$
  }
}

fetch('./wp-content/arbreintegral.json').then(function(response) {
    return response.json()
  }).then(function(json) {
      AI = makeAI(json);
      let drivers = {
        DOM: makeDOMDriver('#page'),
        // History: makeHistoryDriver(),
        Viz: makeVizDriver(AI),
        LocalStorageSource: makeLocalStorageSourceDriver('arbreintegral'),
        LocalStorageSink: makeLocalStorageSinkDriver('arbreintegral')
      };

      run(main, drivers);
  })
// .catch(function(ex) {
//       console.log('parsing failed', ex)
//   }); 
