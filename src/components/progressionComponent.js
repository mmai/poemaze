import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export default function ProgressionComponent(sources) {
  // const DOMSource = sources.DOM;
  let vtree$ = sources.prop$.map(props => {
      let progressElems = props.map(isUp => h(`span.${isUp?"ai-up":"ai-down"}`));
      for (let i = props.length; i < 127 ; i++){
        progressElems.push(h("span"));
      }
      return h('div.situation-container', [
          h('div.situation-begin', "0"),
          h('div.situation', progressElems),
          h('div.situation-end', [h('img', {attrs:{src:`${assetsDir}/cross.svg`}})])
        ])
    });

  return {
    DOM: vtree$,
    // value$,
  };
}
