export function serialize(state$) {
  return state$.map(JSON.stringify);
};

const safeJSONParse = str => JSON.parse(str) || {pathname: '/', currentLeafId: "0", visitedLeafs:{}};
export function deserialize(localStorageValue$) {
  return localStorageValue$.map(safeJSONParse);
};
