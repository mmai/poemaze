import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderCover(){
  return (
    h("div.main-container", [
      h("div.home-content", [
        h('img.home-logo', {attrs:{src:`${assetsDir}/logo-home.svg`}}),
        h('div.home-title', [
          h('div.first-line', "original idea by"),
          h('div.second-line', "Donatien Garnier"),
          h('div.third-line', "design Franck Tallon"),
      ])
    ])
  ]))
}

export function renderRoot(leafInfos){
  let leftchild = leafInfos.neighbors.leftChild;
  let rightchild = leafInfos.neighbors.rightChild;

  let linkUp = leftchild.leaf.id + "?trace=" + leftchild.fromId;
  let linkDown = rightchild.leaf.id + "?trace=" + rightchild.fromId;
  const replayCover = 'var e = document.querySelector(".start-page"); e.classList.remove("start-page"); e.offsetWidth = e.offsetWidth; e.classList.add("start-page"); return false;';
  return h("div.main-container.start-page", [
      h("div.start-content", [
          h("div.start-square", [
              h("div.start-inner", [
                  h("span.n", [ h("a.ai-up", {attrs: {"href": linkUp}}, "E") ]),
                  h("span.nw", [ h("a.ai-up", {attrs: {"href": linkUp}}, "L") ]),
                  h("span.ne", [ h("a.ai-up", {attrs: {"href": linkUp}}, "N") ]),
                  h("span.w", [ h("a.ai-up", {attrs: {"href": linkUp}}, "H") ]),
                  h("span.c", [ h("a.pink.big", {attrs: {"href": "/", "onclick": replayCover}}, "0") ]),
                  h("span.e", [ h("a.ai-down", {attrs: {"href": linkDown}}, "M") ]),
                  h("span.sw", [ h("a.ai-down", {attrs: {"href": linkDown}}, "I") ]),
                  h("span.se", [ h("a.ai-down", {attrs: {"href": linkDown}}, "G") ]),
                  h("span.s", [ h("a.ai-down", {attrs: {"href": linkDown}}, "R") ])
                ])
            ])
        ])
    ])
}

