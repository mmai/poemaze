require("./arbreintegral.scss")
import 'whatwg-fetch' // fetch polyfill for older browsers
import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeHistoryDriver, filterLinks } from '@cycle/history';
import {makeHTTPDriver} from '@cycle/http';

import {makeAI} from './arbreintegral';
import {makeVizDriver, makeLogoVizDriver} from './arbreintegralVizDriver';
import {makeLocalStorageSinkDriver, makeLocalStorageSourceDriver} from './localstorageDriver';
import {serialize, deserialize} from './visitedLeafSerializer';
import {renderLeaf, renderPdf} from './view';
import {progressionComponent} from './progressionComponent';

fetch('./wp-content/arbreintegral.json')
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
     const AI = makeAI(json);

     function model(state, url){
       let newVisited = state.visitedLeafs;
       let curleafid = url.pathname || "0";
       let editionId = state.editionId;
       let showDashboard = (url.pathname == "dashboard");

       if (url.pathname == "reset"){
         return makeInitialState();
       }  

       if (url.pathname == "pdf"){
         return {
           pathname: url.pathname,
           currentLeafId: state.currentLeafId,
           visitedLeafs: state.visitedLeafs,
           isUpside: state.isUpside,
           showDashboard: state.showDashboard,
           editionId: "pending",
           leafInfos: state.leafInfos
         };
       }

       if (url.pathname == "dashboard" || url.pathname == "main"){
         return {
           pathname: state.pathname,
           currentLeafId: state.currentLeafId,
           visitedLeafs: state.visitedLeafs,
           isUpside: state.isUpside,
           showDashboard,
           editionId: state.editionId,
           leafInfos: state.leafInfos
         };
       }

       if (!(curleafid in state.visitedLeafs)){
         newVisited[curleafid] = url.from;
       }

       let isUpside = state.isUpside;
       let elems = curleafid.split('.');
       if (elems.length === 5){
         isUpside = elems[1] == 0;
       }

       let exclude = JSON.parse(JSON.stringify(newVisited));
       const nbVisited = Object.keys(exclude).length;
       //Last leaf only available when all tree has been seen
       if(nbVisited < 126) {
         exclude["0.1.1.1.1.1.1"] = "0.1.1.1.1.1.1";
       } 

       let leaf = AI.getLeaf(curleafid);

       return {
         pathname: url.pathname,
         currentLeafId: curleafid,
         visitedLeafs: newVisited,
         isUpside,
         showDashboard,
         editionId,
         leafInfos: {
           leaf: leaf,
           type: AI.getType(leaf),
           neighbors: AI.getNeighbors(leaf, {exclude:exclude})
         }
       };
     }

     // function view(state){
       function view({state, urlList}){
         //XXX : logged twice, why ?
         // console.log(`view:${state.pathname}`);
         switch (state.pathname) {
         case 'pdf':
           if (state.editionId === "pending") {
             return h('div#maincontainer', "Edition du document...");
           } else {
             return renderPdf(state.editionId);
           }
         default:
           let history = [];
           for (let i in urlList) {
             history.push(AI.getLeaf(urlList[i]));
           }

           return renderLeaf(state.showDashboard, state.isUpside, state.leafInfos, history);
         }
         return h("div", 'Page non trouvée');
       }

       function main({DOM, HTTP, Viz, LogoViz, LocalStorageSource}) {
         // function main({DOM, History, Viz, LocalStorageSource}) {
           //DOM => History/Actions
           const clicked$ = DOM
           .select('a')
           .events('click')
           .filter(filterLinks);
           // .map(e => e.target).share();

           const navigationClick$ = clicked$
           .map(event =>  {
               let [pathname, from] = event.currentTarget.hash.slice(1).split('-');
               return {
                 pathname: pathname,
                 from: from 
               };
             });

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

           const stateFromUrl$ = url$
           .scan(model, makeInitialState())
           .shareReplay()
           .distinctUntilChanged();

           const apiRes$ = HTTP
           .mergeAll()
           // .filter(res => res.request.indexOf(WP_API) === 0)
           .withLatestFrom(stateFromUrl$, function(res, state){ 
               state.editionId = res.body;
               return state;
             });

           const state$ = stateFromUrl$.merge(apiRes$);

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
           const view$ = state$
           .combineLatest(storedUrlList$, function (state, urlList){
               return {
                 state: state,
                 urlList: JSON.parse(urlList).map(url => url.pathname).filter(pathname => pathname !="0")
               };
             }).map( view );

           //url => HTTP (wordpress API calls)
           let apiCall$ = url$
           .filter(url => ( url.pathname == 'pdf' ))
           .withLatestFrom(storedUrlList$, function(url, urlList){
               let path = JSON.parse(urlList).map(url => getPathIndex(url.pathname)).join('-');
               // let apiUrl = `fakeapi.json`;
               let apiUrl = `wp-json/arbreintegral/v1/path/${path}`;
               return apiUrl;
             })


           //State => Viz
           const visitedLeaf$ = state$.map(state => {
               let fromId = state.visitedLeafs[state.currentLeafId];
               if (fromId === undefined && state.currentLeafId === "0") fromId = "0";
               return {
                 reset: Object.keys(state.visitedLeafs).length < 1,
                 leaf: state.leafInfos.leaf,
                 neighbors: state.leafInfos.neighbors,
                 fromId: fromId,
                 isUpside: state.isUpside,
               };
             })
           .filter(leaf => leaf.fromId !== undefined)
           .distinctUntilChanged()

           const dashboardOpened$ = url$.filter(({pathname, from}) => pathname === "dashboard")
           const visitedLeafBuffer$ = visitedLeaf$.buffer(dashboardOpened$)

           return {
             DOM: view$,
             HTTP: apiCall$,
             // History: history$,
             Viz: visitedLeafBuffer$,
             LogoViz: visitedLeaf$,
             LocalStorageSink: storedUrlList$
           }
         }

         function getPathIndex(path){
           //Translate path to its binary representation: replace initial '0' by '1' and
           //remove dots. ex : "0.1.0.1" => "1101"
           const binaryPath = "1" + path.replace(/\./g, '').slice(1);
           //Convert to decimal base integer
           return parseInt(binaryPath, 2)
         }

         function makeInitialState(){
           return {
             pathname: '/',
             currentLeafId: "0",
             visitedLeafs:{},
             isUpside: true,
             editionId: false,
             showDashboard: false,
             leafInfos: {
               leaf: { id: "0" },
               type: "ROOT",
               neighbors: AI.getNeighbors({ id: "0" })
             }};
         }

         let drivers = {
           DOM: makeDOMDriver('#page', {'ai-progression':progressionComponent}),
           // History: makeHistoryDriver(),
           HTTP: makeHTTPDriver(),
           Viz: makeVizDriver(AI),
           LogoViz: makeLogoVizDriver(AI),
           LocalStorageSource: makeLocalStorageSourceDriver('arbreintegral'),
           LocalStorageSink: makeLocalStorageSinkDriver('arbreintegral')
         };

         run(main, drivers);
       })
