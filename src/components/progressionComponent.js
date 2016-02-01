import {h} from '@cycle/dom';

export default function ProgressionComponent(sources) {
  // const DOMSource = sources.DOM;
  let vtree$ = sources.prop$.map(props => {
      let progressElems = props.map(isUp => h("div", {className: isUp?"ai-progress-up":"ai-progress-down"}));
      for (let i = props.length; i < 127 ; i++){
        progressElems.push(h("div", {className: 'ai-progress-remaining'}));
      }
      return h('div', {className: 'ai-progress-container'}, [
          h('div', {className: 'ai-progress'}, progressElems)]);
    });

  return {
    DOM: vtree$,
    // value$,
  };
}
