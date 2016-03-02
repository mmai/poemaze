//Cyclejs
import {Observable} from 'rx';
import {run} from '@cycle/core';
import storageDriver from '@cycle/storage';
import {makeDOMDriver} from '@cycle/dom';
import {makeHistoryDriver} from '@cycle/history';
import {makeHTTPDriver} from '@cycle/http';
import isolate from '@cycle/isolate';

import intent from './intent'

import {makeAI} from './arbreintegral';
import {makeModel} from './model';
import {serialize, deserialize} from './aiStateSerializer';

import ProgressionComponent from './components/progressionComponent'
import {makeAiSvgComponent} from './components/arbreintegralSvgComponent'

import view from './view'
import {renderDashboard} from './views/dashboard'
import {cleanSvgCover} from './views/pdf';

import {env} from 'settings'
import {svgStyle, pdfStyle, logoStyle} from './vizStyles'

const xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = () => {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    startAI(JSON.parse(xmlhttp.responseText));
  }
};
xmlhttp.open("GET", '/wp-content/arbreintegral.json', true);
xmlhttp.send();

function startAI(json) {
  const AI = makeAI(json);
  const model = makeModel(AI);
  const AiSvgComponent = makeAiSvgComponent(AI, svgStyle)
  const AiPdfSvgComponent = makeAiSvgComponent(AI, pdfStyle)
  const AiLogoSvgComponent = makeAiSvgComponent(AI, logoStyle)

  function main({DOM, History, HTTP, storage}) {
    const editionIdFromPdfAPI$ = HTTP.mergeAll().map(res => res.body).share()
    const initialState$ = deserialize(
      storage.local.getItem('arbreintegralState'),
      AI.makeInitialState()
    ).take(1)

    const actions = intent(DOM, History)
    const state$ = model(initialState$, editionIdFromPdfAPI$, actions)

    //XXX side effect to avoid all the cycle.js driver boilerplate for a single variable 
    //better put this in state$ ?
    actions.readPoem$.subscribe((click) => {window.aiPageType = "poem" })

    const leafLinks$ =  state$.map( state => state.history )
    .share()

    //State => DOM
    //Progression component
    const progressionSources = {
      prop$: leafLinks$.map(
        leafLinks => leafLinks.map(
          url => {
            let elems = url.pathname.split('');
            return (elems.length === 1) ? "" : (elems[1] === "0" )
          }
        )
      )
    }
    const progression = isolate(ProgressionComponent)(progressionSources);

    //State => Viz
    const visitedLeaf$ = state$
    .map( s => ({
          history:s.history,
          hl: s.history.length,//need a additional variable because history is an array
          leaf: s.leafInfos.leaf,
          fromId: s.leafInfos.fromId,
          neighbors: s.leafInfos.neighbors,
          isUpside: s.isUpside,
          needRotation: s.needRotation,
          isNewLeaf: true
        }))
    .scan( (acc, vf) => {
        return {
          history:vf.history,
          hl:vf.history.length,
          leaf: vf.leaf,
          fromId: vf.fromId,
          neighbors: vf.neighbors,
          isUpside: vf.isUpside,
          needRotation: vf.needRotation,
          isNewLeaf: vf.hl !== acc.hl //beware : do not use directly vf.history.length : array mutates during the scan
        }
      })
    .share()

    //Mini viz component : show live evolution
    const aiLogoSvg = isolate(AiLogoSvgComponent)({ visitedLeaf$ })

    //Svg used in pdf cover
    const aiPdfSvg = isolate(AiPdfSvgComponent)({ visitedLeaf$ })

    //Main viz compononent
    const delayedVisitedLeaf$ = visitedLeaf$
    .buffer(actions.dashboardOpen$.startWith(true)) // Wait for the dashboard to be opened before showing progression
    // .buffer(state$.map(s => s.showDashboard)) // Wait for the dashboard to be opened before showing progression
    .map(addRotationAnimationDelay) // add fake leafs to delay rotation animation
    .flatMap(visitedLeafs => yieldByInterval(visitedLeafs, 100)) // wait 0.1s between each line drawing (animation)
    .filter(leafInfos => leafInfos !== false) //remove fake leafs
    .share()
    const aiSvg = isolate(AiSvgComponent)({ visitedLeaf$: delayedVisitedLeaf$});

    //Final view
    let history$ = leafLinks$
    .map( leafLinks =>
      leafLinks.map(leafLink => AI.getLeaf(leafLink.pathname))
    )
    .share()

    // const dashboardView$ = Observable.combineLatest([state$, history$, progression.DOM, aiLogoSvg.DOM, aiSvg.DOM],
      // function(state, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree){
        // return renderDashboard(state.showDashboard, state.isUpside, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree)
    //XXX beware : we can't directly use state$  
    const stateInfos$ = state$.map(s => ({showDashboard: s.showDashboard, isUpside: s.isUpside}))

    const dashboardView$ = Observable.combineLatest([stateInfos$, history$, progression.DOM, aiLogoSvg.DOM, aiSvg.DOM],
      function(stateInfos, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree){
        return renderDashboard(stateInfos.showDashboard, stateInfos.isUpside, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree)
      }
    )
    .share()

    const view$ = dashboardView$.withLatestFrom(state$, view)

    //url => HTTP (wordpress API calls)
    let apiCall$ = actions.makePdf$
    .withLatestFrom(aiPdfSvg.DOM, (url, svg) => cleanSvgCover(svg))
    .withLatestFrom(leafLinks$, function(svgCover, leafLinks){
        let path = leafLinks.map(leafLink => getPathIndex(leafLink.pathname)).join('-');
        let url = `wp-json/arbreintegral/v1/path/${path}`;
        if (env === 'dev') { url =  'fakeapi.json'; }
        return {
          url,
          method: 'POST',
          eager: true, //XXX if 'eager: false', it makes  4 requests to the backend...
          send: {
            'svg': svgCover
          }
        };
      })

    const storage$ = serialize(state$.filter(s => s.editionId !== 'pending')).map(state => ({
          key: 'arbreintegralState', value: state
        }));

    const redirect$ = state$
    .filter(s => s.needRedirect)
    .map(s => `#${s.currentLeafId}`)

    const browserHistory$ = actions.gotoPoem$.merge(redirect$)

    return {
      DOM: view$,
      HTTP: apiCall$,
      History: browserHistory$,
      storage: storage$
    }
  }

  let drivers = {
    DOM: makeDOMDriver('#ai-page'),
    History: makeHistoryDriver({
        // basename: '/poeme'
      }),
    HTTP: makeHTTPDriver(),
    storage: storageDriver,
  };

  run(main, drivers);
}

/**
 * Translate leaf path to an integer via its binary representation
 *
 * @param {string} path
 * @return {number}
 */
function getPathIndex(path){
  //Translate path to its binary representation:
  //replace initial '0' by '1'
  //ex : "0101" => "1101"
  const binaryPath = "1" + path.slice(1);
  //Convert to decimal base integer
  return parseInt(binaryPath, 2)
}

/**
 * Make an Observable from an array and wait a given amount of time between each emission
 *
 * @param {array} items - array of values to yield
 * @param {number} time - interval in milliseconds
 * @return {Observable}
 */
 function yieldByInterval(items, time) {
   return Observable.zip(
     Observable.from(items), Observable.interval(time),
     (item, index) => item
   )
 }

 /**
  * Add fake visited leafs when a rotation is needed in order to
  * simulate a longuer delay before next real visited leaf event
  *
  * @param visitedLeaf
  * @return {array}
  */
  function addRotationAnimationDelay(visitedLeafs){
    if (visitedLeafs.length === 0) return []

    const fakeLeafs = [ false, false, false, false, false ]
    return visitedLeafs.map(
      vleaf => (vleaf.needRotation)?[vleaf, ...fakeLeafs]:[vleaf]
    ).reduce(
      (acc, vleafs) => acc.concat(vleafs)
    )
  }
