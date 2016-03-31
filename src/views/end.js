import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderEnd(leafInfos){
  return h("div.main-container", [
      h("div.end-content", [
          h("div.end-cross", [
              h("div.end-text", leafInfos.leaf.content),
              h('img', {attrs:{src:`${assetsDir}/cross.svg`, alt:"Fin"}})
            ]),
          h("a.blink_text", {attrs:{href: "/pdf"}}, "Sauvegarder le livre" )
        ]),
      h("div.breadcrumb", [ h("div", leafInfos.leaf.name)]),
      h("div.ai-last-restart", [ h("a", {attrs:{href: "/reset"}}, "Recommencer")]),
    ])
}

