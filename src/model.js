import {Observable} from 'rx';

let debugCount = 0;

export function makeModel(AI) {
  return function model(initialState$, editionIdFromPdfAPI$, actions){
    const mod$ = modifications(actions)

    const modFromAPI$ = editionIdFromPdfAPI$.map(id =>
      function(state){
        state.editionId = id
        return state
      })

    return initialState$
    .concat(mod$.merge(modFromAPI$))
    .scan( (state, mod) => mod(state))
    .share() 
  }

  function modifications(actions){
    const resetMod$ = actions.reset$.map(
      () => AI.makeInitialState.bind(AI)
    ).share()

    const makePdfMod$ = actions.makePdf$.map(click => function(state){
        return {
          pathname: click.pathname,
          currentLeafId: state.currentLeafId,
          history: state.history,
          isUpside: state.isUpside,
          showDashboard: state.showDashboard,
          editionId: "pending",
          leafInfos: state.leafInfos
        };
      }).share()

    const dashboardOpenMod$ = actions.dashboardOpen$
    .map(click => function(state){
        return {
          pathname: state.pathname,
          currentLeafId: state.currentLeafId,
          history: state.history,
          isUpside: state.isUpside,
          showDashboard: true,
          editionId: state.editionId,
          leafInfos: state.leafInfos
        };
      }).share()

    const dashboardCloseMod$ = actions.dashboardClose$.map(click => function(state){
        return {
          pathname: state.pathname,
          currentLeafId: state.currentLeafId,
          history: state.history,
          isUpside: state.isUpside,
          showDashboard: false,
          editionId: state.editionId,
          leafInfos: state.leafInfos
        };
      }).share()

    const readPoemMod$ = actions.readPoem$.map(click => {
        return function(state){
        const currentLeafId = click.pathname || "0"
        const leaf = AI.getLeaf(currentLeafId);

        let history = state.history
        let fromId = state.leafInfos.fromId;

        if (undefined === state.history.find(leafLink => leafLink.pathname === currentLeafId)){
          fromId = click.from
          history.push({ pathname: currentLeafId, from: fromId })
        }

        let isUpside = state.isUpside;
        let elems = currentLeafId.split('.');
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
          exclude["0.1.1.1.1.1.1"] = "0.1.1.1.1.1.1";
        } 

        return {
          pathname: click.pathname,
          currentLeafId,
          history,
          isUpside,
          needRotation: (isUpside != state.isUpside),
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

    // return readPoemMod$.merge([dashboardOpenMod$, dashboardCloseMod$, makePdfMod$]) // do not work, why ?
    return Observable.merge([ readPoemMod$, makePdfMod$, dashboardOpenMod$, dashboardCloseMod$, resetMod$ ])
    .share()
  }

}
