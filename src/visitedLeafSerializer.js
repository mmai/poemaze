const basetime = Date.now();
console.log('Init storage: ' + (Date.now() - basetime));
export function serialize(state$) {
  return state$.map( state => {
      console.log('storage: ' + (Date.now() - basetime));
      return JSON.stringify(state)
    }
  );
};

const safeJSONParse = str => JSON.parse(str) || [];
export function deserialize(localStorageValue$) {
  return localStorageValue$
    .map(safeJSONParse)
};
