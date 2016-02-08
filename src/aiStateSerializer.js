export function serialize(state$) {
  return state$.map( state => {
      //Dashboard always start closed
      state.showDashboard = false

      return JSON.stringify(state)
    }
  );
};

export function deserialize(localStorageValue$, initialState) {
  return localStorageValue$.map(str =>
    JSON.parse(str) || initialState
  )
};
