require("./arbreintegral.scss")

//Cyclejs
import {run} from '@cycle/core';
import {Observable} from 'rx';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeHistoryDriver, filterLinks } from '@cycle/history';
import {makeHTTPDriver} from '@cycle/http';

import {makeAI} from './arbreintegral';
import {makeModel} from './model';
import {makeVizDriver, makeLogoVizDriver} from './arbreintegralVizDriver';
import {makeLocalStorageSinkDriver, makeLocalStorageSourceDriver} from './localstorageDriver';
import {serialize, deserialize} from './visitedLeafSerializer';
import {progressionComponent} from './progressionComponent';

import {renderDashboard} from './views/dashboard'
import {renderCover}     from './views/cover'
import {renderPoem}      from './views/poem';
import {renderEnd}       from './views/end'
import {renderPdf}       from './views/pdf';

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
        let history = urlList.map(AI.getLeaf);
        let dashboardView = renderDashboard(state.showDashboard, state.isUpside, history);
        let views = [];
        if (window.aiPageType === "wordpress") {
          views.push(h('div'))//XXX if not present, it seems to harm virtual-dom (it makes fail e2e test "poem is made of 3 circles divs" for example), I don't know exactly why :-( ...
          views.push(dashboardView)
        } else {
          switch (history.length){
          case 0:
            views.push(renderPoem(state.showDashboard, state.isUpside, state.leafInfos))
            views.push(renderCover());
            break;
          case 126:
            views.push(renderEnd(state.leafInfos));
            views.push(dashboardView);
            break;
          default:
            // views.push(renderEnd(state.leafInfos));
            views.push(renderPoem(state.showDashboard, state.isUpside, state.leafInfos))
            views.push(dashboardView);
          }
        }
        return h("div#maincontainer", views)
      }

      return h("div", 'Page non trouvée');
    }

    function main({DOM, HTTP, Viz, LogoViz, LocalStorageSource}) {
      // function main({DOM, History, Viz, LocalStorageSource}) {
        //DOM => History/Actions
        const clicked$ = DOM
        .select('a')
        .events('click')
        .filter(filterLinks)
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

        const url$ = deserialize(LocalStorageSource)
        .flatMap( urlList => Observable.from(urlList))
        .concat(
          navigationClick$.merge(svgClick$).map(url => {
              //XXX side effect  
              if (["dashboard", "main"].indexOf(url.pathname) === -1 ){
                window.aiPageType = "poem";
              }
              return url;
            })
        )
        .shareReplay()
        .startWith({pathname:"reset"})

        // const history$ = clicked$.map(event => event.target.href.replace(location.origin, ``));

        const stateFromUrl$ = url$
        .scan(model, AI.makeInitialState())
        .shareReplay()
        .distinctUntilChanged();

        const apiRes$ = HTTP
        .mergeAll()
        // .filter(res => res.request.indexOf(WP_API) === 0)
        .withLatestFrom(stateFromUrl$, function(res, state){ 
            state.editionId = res.body;
            return state;
          });

        const state$ = stateFromUrl$.merge(apiRes$)
        .startWith(AI.makeInitialState());

        //Urls => LocalStorageSink
        const storedUrlList$ = serialize( url$
          .filter(url => ( url.pathname == 'reset' || url.from !== undefined))
          .distinctUntilChanged()
          .scan(function(urlList, url){
              if (url.pathname == 'reset') return [];

              urlList.push(url);
              return urlList;
            }, [])
          .share()
        ) 

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
            let apiUrl = `fakeapi.json`;
            // let apiUrl = `wp-json/arbreintegral/v1/path/${path}`;
            return apiUrl;
          })


        //State => Viz
        let initialState = AI.makeInitialState();
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
          LogoViz: visitedLeaf$,
          Viz: visitedLeafBuffer$,
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

      let drivers = {
        DOM: makeDOMDriver('#ai-page', {'ai-progression':progressionComponent}),
        // History: makeHistoryDriver(),
        HTTP: makeHTTPDriver(),
        LogoViz: makeLogoVizDriver(AI),
        Viz: makeVizDriver(AI),
        LocalStorageSource: makeLocalStorageSourceDriver('arbreintegral'),
        LocalStorageSink: makeLocalStorageSinkDriver('arbreintegral')
      };

      run(main, drivers);
    }
