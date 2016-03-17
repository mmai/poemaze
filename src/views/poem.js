/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp, renderNeighorLink} from './utils'
import {renderRoot} from './cover'
import {renderShare} from './share'
var parser = require("vdom-parser");

// export function renderLeaf(leafInfos){
export function renderPoem(isUpside, leafInfos){
  let circlesView = h("div");
  switch(leafInfos.type){
  case 'ROOT':
    circlesView = renderRoot(leafInfos);
    break;
  case 'DOWN': 
    circlesView = isUpside?renderLeafReversed(leafInfos):renderLeafUpside(leafInfos);
    break;
  default: 
    circlesView = isUpside?renderLeafUpside(leafInfos):renderLeafReversed(leafInfos);
  }

  return circlesView;
}

function renderLeaf(leafInfos, linksDom){
  return h("div.main-container", [
      h("div.navigate-content", linksDom),
      h("div.breadcrumb", [h("div", leafInfos.leaf.name)]),
      renderShare("http://arbre-integral.net", leafInfos.leaf.content)
    ])
}
      //
      // <div className={"ai-text circle-" + circleLevel + " " + classUp}>
      //   <div>
      //    <span className="tree-breadcrumb">{leafInfos.leaf.name}</span>
      //   </div>
      // </div>

function renderLeafReversed(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('').length - 1;
  return renderLeaf(leafInfos, [
      renderNeighorLink("n", leafInfos.neighbors.parent),
      renderNeighorLink("w", leafInfos.neighbors.leftBrother),
      parser(`<blockquote>${leafInfos.leaf.content}</blockquote>`),
      renderNeighorLink("e", leafInfos.neighbors.rightBrother),
      renderNeighorLink("sw", leafInfos.neighbors.rightChild),
      renderNeighorLink("se", leafInfos.neighbors.leftChild)
    ])
}
      //
      // <div className={"ai-text circle-" + circleLevel + " " + classUp}>
      //   <div>
      //    <span className="tree-breadcrumb">{leafInfos.leaf.name}</span>
      //   </div>
      // </div>

function renderLeafUpside(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('').length - 1;
  return renderLeaf(leafInfos, [
        renderNeighorLink("nw", leafInfos.neighbors.leftChild),
        renderNeighorLink("ne", leafInfos.neighbors.rightChild),
        renderNeighorLink("w", leafInfos.neighbors.leftBrother),
        parser(`<blockquote>${leafInfos.leaf.content}</blockquote>`),
        renderNeighorLink("e", leafInfos.neighbors.rightBrother),
        renderNeighorLink("s", leafInfos.neighbors.parent)
      ])
}

