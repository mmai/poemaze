export function serialize(state$) {
  return state$.map(JSON.stringify);
};

const safeJSONParse = str => JSON.parse(str) || [];
const ensureNewformat = function (paths){
  if (paths
    .filter(path => path.pathname.indexOf("2") > -1 )
    .length > 0) return []; 
  return paths;
};
export function deserialize(localStorageValue$) {
  return localStorageValue$
    .map(safeJSONParse)
    .map(ensureNewformat);
};
