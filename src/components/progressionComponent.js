import {h} from '@cycle/dom';

export default function ProgressionComponent(sources) {
  // const DOMSource = sources.DOM;
  let vtree$ = sources.prop$.map(props => {
      let progressElems = props.map(isUp => h("span", {className: isUp?"blue":"brown"}));
      for (let i = props.length; i < 127 ; i++){
        progressElems.push(h("span"));
      }
      return h('div.situation-container', [
          h('div.situation-begin', "0"),
          h('div.situation', progressElems),
          h('div.situation-end', [h('img', {src:"wp-content/themes/arbre-integral/img/assets/cross.svg"})])
        ])
    });

  return {
    DOM: vtree$,
    // value$,
  };
}
