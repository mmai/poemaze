import {Observable} from 'rx'
import {lastLeafId} from 'settings'
import {dataFromTxt} from './aiDataFromTxt'

export function makeModel(AI) {
  return function model(initialState$, actions){
    const mod$ = modifications(actions)

    return initialState$
    .concat(mod$)
    .scan( (state, mod) => mod(state))
    .share() 
  }

  function modifications(actions){
    const resetMod$ = actions.reset$.map(
      () => AI.makeInitialState.bind(AI)
    ).share()

    const showJourneyMod$ = actions.showJourney$.map(click => (
        state => ({ ...state,
          pathname: click.pathname
        })
    )).share()

    const chooseSourceMod$ = actions.chooseSource$.map(click => (
        state => ({ ...state,
          pathname: click.pathname
        })
    )).share()

    const submitSourceMod$ = actions.submitSource$.map(txt => {
        AI.updateAiDataGeter(() => dataFromTxt(txt))
        return () => AI.makeInitialState()
      }).share()

    const dashboardOpenMod$ = actions.dashboardOpen$.map(click => {
        //XXX side effect scroll to top of the dashboard to display the viz animation
        //at the opening of the dashboard
        document.querySelector('.location').scrollIntoView();
        return state => ({ ...state,
            showDashboard: true
          })
      }).share()

    const dashboardCloseMod$ = actions.dashboardClose$.map(click => (
        state => ({ ...state,
          showDashboard: false,
        })
      )).share()

    const readPoemMod$ = actions.readPoem$.map(poem => {
      return function(state){
        const currentLeafId = poem.pathname || "0"
        let history = state.history
        let journey = state.journey || []

        if (!canVisit(currentLeafId, poem.from, state)) {
          return {...state, needRedirect: true}
        }    

        const leaf = AI.getLeaf(currentLeafId);

        let fromId = state.leafInfos.fromId;

        if (undefined === state.history.find(leafLink => leafLink.pathname === currentLeafId)){
          fromId = poem.from
          history.push({ pathname: currentLeafId, from: fromId })
          journey.push(leaf)
        }

        let isUpside = state.isUpside;
        let elems = currentLeafId.split('');
        if (elems.length === 5){
          isUpside = elems[1] == 0;
        }

        let exclude = history.reduce( (obj, leafLink ) => {
            obj[leafLink.pathname] = leafLink.pathname
            return obj
          }, {})
        const nbVisited = Object.keys(exclude).length;
        //Last leaf only available when all tree has been seen
        if(nbVisited < 125) {
          exclude[lastLeafId] = lastLeafId
        } 

        return {
          pathname: poem.pathname,
          currentLeafId,
          history,
          journey,
          isUpside,
          needRotation: (isUpside != state.isUpside),
          needRedirect: false,
          showDashboard: false,
          editionId: state.editionId,
          leafInfos: {
            leaf,
            fromId,
            type: AI.getType(leaf),
            neighbors: AI.getNeighbors(leaf, {exclude})
          }
        }}
      })

    // return readPoemMod$.merge([dashboardOpenMod$, dashboardCloseMod$]) // do not work, why ?
    return Observable.merge([ readPoemMod$, chooseSourceMod$, submitSourceMod$, showJourneyMod$, dashboardOpenMod$, dashboardCloseMod$, resetMod$ ])
    .share()
  }

  function canVisit(id, from, state){
    //TODO check if 'id' belongs to 'from' neighbors
    return ["00", "01"].indexOf(id) !== -1 
        || lastLeafId === from
        || undefined !== state.history.find(leafLink =>
          leafLink.pathname === id || leafLink.pathname === from
        )
  }

}
