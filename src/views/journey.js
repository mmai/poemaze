import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderJourney(journey){
  return h("div.main-container", [
      h("div.journey-content", journey.map(leaf => {
            return h("div", `${leaf.content}`) 
          }
        )),
      h("div.breadcrumb", [ h("div", "Journey")]),
      h("div.ai-last-restart", [ h("a", {attrs:{href: "/reset"}}, "Restart")]),
    ])
}
