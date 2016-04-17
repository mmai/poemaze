import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'
import {renderNeighorLink} from './utils'
import {renderShare} from './share'

export function renderCover(){
  return (
    h("div.main-container", [
      h("div.home-content", [
        h('div.home-title', [
          h('div.second-line', "Where you will wander in a poem as in a maze"),
      ])
    ])
  ]))
}

export function renderRoot(leafInfos){
  return h("div.main-container.start-page", [
      h("div.navigate-content", [
        renderNeighorLink("n", leafInfos.neighbors.leftChild),
        renderNeighorLink("w", false),
        h("blockquote", leafInfos.leaf.content),
        renderNeighorLink("e", false),
        renderNeighorLink("s", leafInfos.neighbors.rightChild)
      ]),
      h("div.breadcrumb", [h("div", leafInfos.leaf.name)]),
      renderShare("http://mmai.github.io/poemaze/", leafInfos.leaf.content)
    ])
}

