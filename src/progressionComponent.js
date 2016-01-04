import {Rx} from '@cycle/core';
import {h} from '@cycle/dom';

export function progressionComponent(responses) {
  let props$ = responses.props.getAll();
  let vtree$ = props$.map(props => {
      // return h('progress', {max:props.max, value:props.value}, props.value);
      // return h('span', props.value.map(isUp => isUp?"-":"_").join(""));
      let progressElems = props.value.map(isUp => h("div", {className: isUp?"ai-progress-up":"ai-progress-down"}));
      progressElems.push(h("div", {className: 'ai-progress-left'}));
      return h('div', {className: 'ai-progress-container'}, [
          h('div', {className: 'ai-progress'}, progressElems)]);
    });

  return {
    DOM: vtree$
  };
}
