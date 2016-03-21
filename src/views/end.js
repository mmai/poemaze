import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderEnd(leafInfos){
  return h("div.main-container", [
      h("div.end-content", [
          h("div.end-cross", [
              h("div.end-text", leafInfos.leaf.content),
              h('img', {src:`${assetsDir}/cross.svg`, alt:"Fin"})
            ]),
          h("a", {href: "/pdf"}, "Sauvegarder le livre" )
        ]),
      h("div.breadcrumb", [ h("div", leafInfos.leaf.name)]),
      h("div.ai-last-restart", [ h("a", {href: "/reset"}, "Recommencer")]),
    ])
}

