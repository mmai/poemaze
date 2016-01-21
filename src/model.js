export function makeModel(AI) {
  return function model(state, url){
    let newVisited = state.visitedLeafs;
    let curleafid = url.pathname || "0";
    let editionId = state.editionId;
    let showDashboard = (url.pathname == "dashboard");

    if (url.pathname == "reset"){
      return AI.makeInitialState();
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
}
