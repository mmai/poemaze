export function serialize(state$) {
  return state$.map(JSON.stringify);
};

const safeJSONParse = str => JSON.parse(str) || [];
export function deserialize(localStorageValue$) {
  return localStorageValue$
    .map(safeJSONParse)
};
