//code executed outside Cyclejs
//imported here to be bundled by webpack with all javascript files
import "./polyfills/classList";
import "babel-polyfill";

//Cyclejs
import {Observable} from 'rx';
import {run} from '@cycle/core';
import storageDriver from '@cycle/storage';
import {modules, makeDOMDriver} from 'cycle-snabbdom'
const {StyleModule, PropsModule, AttrsModule, ClassModule} = modules
import {makeHistoryDriver} from '@cycle/history';
import {makeHTTPDriver} from '@cycle/http';
import isolate from '@cycle/isolate';

import intent from './intent'

import {makeAI} from './arbreintegral';
import {makeModel} from './model';
import {serialize, deserialize} from './aiStateSerializer';

import makeBodyStylesDriver from './drivers/bodyStyles'

import ProgressionComponent from './components/progressionComponent'
import {makeAiSvgComponent} from './components/arbreintegralSvgComponent'

import view from './view'
import {renderDashboard} from './views/dashboard'
import {cleanSvgCover, makePdfApiParams} from './aiPdf';

import {svgStyle, pdfStyle, logoStyle} from './vizStyles'
import {poemFile} from 'settings'

/**
 * fix the sticky :hover style on touch devices
 *
 * @return {undefined}
 */
 function fixHover(){
   if('ontouchstart' in document.documentElement) {
     for(var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
       var sheet = document.styleSheets[sheetI];
       if(sheet.cssRules) {
         for(var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
           var rule = sheet.cssRules[ruleI];
           if(rule.selectorText) {
             rule.selectorText = rule.selectorText.replace(":hover", ":active");
           }
         }
       }
     }
   }
 }

const xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = () => {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    fixHover();
    startAI(JSON.parse(xmlhttp.responseText));
  }
};
xmlhttp.open("GET",poemFile, true);
xmlhttp.send();

function startAI(json) {
  const AI = makeAI(json);
  const model = makeModel(AI);
  const AiSvgComponent = makeAiSvgComponent(AI, svgStyle)
  const AiPdfSvgComponent = makeAiSvgComponent(AI, pdfStyle)
  const AiLogoSvgComponent = makeAiSvgComponent(AI, logoStyle)

  function main({DOM, History, HTTP, storage, bodyStyles}) {
    const editionIdFromPdfAPI$ = HTTP.mergeAll().map(res => res.body).share()
    const actions = intent(DOM, History)

    const initialState$ = deserialize(
      storage.local.getItem('aiState'),
      AI.makeInitialState()
    ).take(1)
    // XXX theses lines because the bodyStyles driver is not executed the first time, see next comment
    .do((s) => {
        const bodyClasses = bodyStylesFromState(s)
        document.body.classList.remove(...(bodyClasses.classes.toRemove))
        document.body.classList.add(...(bodyClasses.classes.toAdd))
      }) 


    //XXX Can't make state$ consistent between bodyStyles and DOM drivers 
    // if no .share(), bodyStyles is not executed for initialState, only on subsequent state updates 
    // if .share() same result (explanation: http://stackoverflow.com/questions/25634375/rxjs-only-the-first-observer-can-see-data-from-observable-share)
    // if shareReplay() : bodyStyles is executed, but events stops and DOM is not updated 
    // if .delay(1) before .share(): same result as shareReplay()
    const state$ = model(initialState$, editionIdFromPdfAPI$, actions).share()

    const bodyClasses$ = state$.map(bodyStylesFromState).distinctUntilChanged()

    //XXX side effect to avoid all the cycle.js driver boilerplate for a single variable 
    //this variable can't be in state$ because it must be initialized outside cyclejs by wordpress pages
    actions.readPoem$.subscribe((click) => {window.aiPageType = "poem" })

    //Quit worpress pages when opening sidebar (UX not really intuitive...)
    actions.dashboardOpen$.subscribe((click) => {window.aiPageType = "poem" })

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
    const visitedLeaf$ = state$.map( s => ({
          history:s.history,
          leaf: s.leafInfos.leaf,
          fromId: s.leafInfos.fromId,
          neighbors: s.leafInfos.neighbors,
          isUpside: s.isUpside,
          needRotation: s.needRotation,
          isNewLeaf:  (s.history.length === 0) || (s.history[s.history.length - 1].pathname === s.pathname)
        }))
    .distinctUntilChanged()
    .share()
    // .do(v => {console.log(v.history.length)})

    //Mini viz component : show live evolution
    const aiLogoSvg = isolate(AiLogoSvgComponent)({ visitedLeaf$ })

    //Main viz compononent
    const delayedVisitedLeaf$ = visitedLeaf$
    .buffer(actions.dashboardOpen$.merge(actions.reset$).startWith(true)) // Wait for the dashboard to be opened before showing progression, except for resets
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
    const aiPdfSvg = isolate(AiPdfSvgComponent)({ visitedLeaf$ })
    const apiCall$ = actions.makePdf$
    .withLatestFrom(aiPdfSvg.DOM, (url, svg) => cleanSvgCover(svg))
    .withLatestFrom(leafLinks$, makePdfApiParams)

    const storage$ = serialize(state$.filter(s => s.editionId !== 'pending'))
      .map(state => ({
          key: 'aiState', value: state
        }));

    const redirect$ = state$
    .filter(s => s.needRedirect)
    .map(s => `${s.currentLeafId}`)

    const browserHistory$ = actions.gotoPoem$.merge(redirect$)

    return {
      DOM: view$,
      bodyStyles: bodyClasses$,
      HTTP: apiCall$,
      History: browserHistory$,
      storage: storage$
    }
  }

  let drivers = {
    // DOM: makeDOMDriver('#ai-page'),
    bodyStyles: makeBodyStylesDriver(),
    DOM: makeDOMDriver('#app', { modules: [StyleModule, PropsModule, AttrsModule, ClassModule], }),
    History: makeHistoryDriver({
        // basename: '/poeme'
      }),
    HTTP: makeHTTPDriver(),
    storage: storageDriver,
  };

  run(main, drivers);
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
    return visitedLeafs.map(
      vleaf => (vleaf.needRotation)?[vleaf, false, false, false, false, false]:[vleaf]
    ).reduce(
      (acc, vleafs) => acc.concat(vleafs)
    )
  }

  /**
   * Compute body classes from the state
   *
   * @param {Object} state
   * @return {Object}
   */
  function bodyStylesFromState(state){
      const l = state.leafInfos
      let toRemove = ['wordpress-page', 'circle6-page', 'day-page', 'night-page', 'other-page']
      let toAdd = []
      if (window.aiPageType === "wordpress") {
        toAdd.push(toRemove.splice(toRemove.indexOf('wordpress-page'), 1))
      } else {
        let circle = l.leaf.id.split('').length - 1
        if (6 === circle) {
          toAdd.push(toRemove.splice(toRemove.indexOf('circle6-page'), 1))
        } else if (0 === circle) {
          toAdd.push(toRemove.splice(toRemove.indexOf('other-page'), 1))
        } else if (l.type === "UP"){
          toAdd.push(toRemove.splice(toRemove.indexOf('day-page'), 1))
        } else {
          toAdd.push(toRemove.splice(toRemove.indexOf('night-page'), 1))
        }
      } 
      return { classes:{toAdd, toRemove} }
  }

