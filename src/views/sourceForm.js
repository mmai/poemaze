import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderSourceForm(){
  return h("div.main-container", [
      h("div.form-content", [
        h("textarea#newsource-form--textarea"),
        h("input#newsource-form--submit", {attrs: {type: 'submit'}})
      ]),
      h("div.breadcrumb", [ h("div", "New source text")]),
    ])
}
