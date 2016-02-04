require("./arbreintegral.scss")

//Cyclejs
import {Observable} from 'rx';
import {run} from '@cycle/core';
import storageDriver from '@cycle/storage';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeHistoryDriver, filterLinks } from '@cycle/history';
import {makeHTTPDriver} from '@cycle/http';
import isolate from '@cycle/isolate';

import {makeAI} from './arbreintegral';
import {makeModel} from './model';
import {serialize, deserialize} from './visitedLeafSerializer';

import ProgressionComponent from './components/progressionComponent'
import {makeAiSvgComponent} from './components/arbreintegralSvgComponent'

import {renderDashboard} from './views/dashboard'
import {renderCover}     from './views/cover'
import {renderPoem}      from './views/poem';
import {renderEnd}       from './views/end'
import {renderPdf, cleanSvgCover} from './views/pdf';

import {env} from 'settings'

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
  const AiLogoSvgComponent = makeAiSvgComponent(AI, {
      width: 120,
      height: 120,
      leafRadius: 1,
      circleRadius: 8,
      color_background: "black",
      origin: {x:0, y:0},
      color_up: "rgb(72,122,189)",
      color_down: "rgb(128,120,48)",
      color_brothers: "#BBBBBB",
      color_default: "black",
      color_skeleton: "#DFDFDF",
      displayNeighbors:false
    })

  const AiSvgComponent = makeAiSvgComponent(AI, {
    width: 480,
    height: 480,
    leafRadius: 3,
    circleRadius: 30,
    color_background: "whitesmoke",
    origin: {x:0, y:0},
    color_up: "rgb(72,122,189)",
    color_down: "rgb(128,120,48)",
    color_brothers: "#BBBBBB",
    color_default: "black",
    color_skeleton: "#DFDFDF",
  })

  // function view(state){
    function view(state, urlList, progressionVtree, aiLogoSvgVTree, aiSvgVTree){
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
        let dashboardView = renderDashboard(state.showDashboard, state.isUpside, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree);
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
          case 5:
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

    function main({DOM, HTTP, storage}) {
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

        const localStorage$ = storage.local.getItem('arbreintegral').take(1);//initial data
        const url$ = deserialize(localStorage$)
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

        //Urls => storage
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

        const urlList$ =  storedUrlList$.map(urlList => 
          JSON.parse(urlList).map(url => url.pathname).filter(pathname => pathname !="0")
        )

        //State => DOM
        //Progression component
        const progressionSources = {
          prop$: urlList$.map(
            urlList => urlList.map(
              url => {
                let elems = url.split('.');
                return (elems.length === 1) ? "" : (elems[1] === "0" )
              }
            )
          )
        }
        const progression = isolate(ProgressionComponent)(progressionSources);

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
              needRotation: state.needRotation,
            };
          })
        .filter(leaf => leaf.fromId !== undefined)
        .distinctUntilChanged()

        //Mini viz component : show live evolution
        const aiLogoSvg = isolate(AiLogoSvgComponent)({ visitedLeaf$ });

        //Main viz compononent
        const dashboardOpened$ = url$.filter(({pathname, from}) => pathname === "dashboard")
        const delayedVisitedLeaf$ = visitedLeaf$
          .buffer(dashboardOpened$) // Wait for the dashboard to be opened before showing progression
          .map(addRotationAnimationDelay) // add fake leafs to delay rotation animation
          .flatMap(visitedLeafs => yieldByInterval(visitedLeafs, 100)) // wait 0.1s between each line drawing (animation)
          .filter(dleaf => dleaf !== false) //remove fake leafs
          .startWith({ reset:true, leaf: {id:"0"}, fromId: "0", neighbors:[], isUpside:true }) //Init rendering with dummy leaf
        const aiSvg = isolate(AiSvgComponent)({ visitedLeaf$: delayedVisitedLeaf$});

        //Final view
        const view$ = state$.combineLatest( urlList$, progression.DOM, aiLogoSvg.DOM, aiSvg.DOM, view);

        //url => HTTP (wordpress API calls)
        let apiCall$ = url$
        .filter(url => ( url.pathname == 'pdf' ))
        .withLatestFrom(aiLogoSvg.DOM, (url, svg) => cleanSvgCover(svg))
        .withLatestFrom(storedUrlList$, function(svgCover, urlList){
            let path = JSON.parse(urlList).map(url => getPathIndex(url.pathname)).join('-');
            // let url = `http://arbre-integral.net/wp-json/arbreintegral/v1/path/${path}`;
            let url = `wp-json/arbreintegral/v1/path/${path}`;
            if (env === 'dev') { url =  'fakeapi.json'; }
            return {
              url,
              method: 'POST',
              send: {
                'svg': svgCover
              }
            };
          })

        const storage$ = storedUrlList$.map((urlList) => ({
              key: 'arbreintegral', value: urlList
            }));

        return {
          DOM: view$,
          HTTP: apiCall$,
          // History: history$,
          storage: storage$
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
        DOM: makeDOMDriver('#ai-page'),
        // History: makeHistoryDriver(),
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
      return Rx.Observable.from(items).zip(
        Rx.Observable.interval(time),
        function(item, index) { return item; }
      );
    }

    /**
     * Add fake visited leafs when a rotation is needed in order to
     * simulate a longuer delay before next real visited leaf event
     *
     * @param visitedLeaf
     * @return {array}
     */
    function addRotationAnimationDelay(visitedLeafs){
      const fakeLeafs = [ false, false, false, false, false ]
      return visitedLeafs.map(
        vleaf => (vleaf.needRotation)?[vleaf, ...fakeLeafs]:[vleaf]
      ).reduce((acc, vleafs) => acc.concat(vleafs))
    }
