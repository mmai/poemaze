import {h} from 'cycle-snabbdom'
import {isUp, renderNeighorLink} from './utils'
import {renderRoot} from './cover'
import {renderShare} from './share'

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

function renderLeafReversed(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('').length - 1;
  return renderLeaf(leafInfos, [
      renderNeighorLink("n", leafInfos.neighbors.parent),
      renderNeighorLink("w", leafInfos.neighbors.leftBrother),
      h("blockquote", getHtmlContents(leafInfos.leaf.content)),
      renderNeighorLink("e", leafInfos.neighbors.rightBrother),
      renderNeighorLink("sw", leafInfos.neighbors.rightChild),
      renderNeighorLink("se", leafInfos.neighbors.leftChild)
    ])
}

function renderLeafUpside(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('').length - 1;
  return renderLeaf(leafInfos, [
        renderNeighorLink("nw", leafInfos.neighbors.leftChild),
        renderNeighorLink("ne", leafInfos.neighbors.rightChild),
        renderNeighorLink("w", leafInfos.neighbors.leftBrother),
        h("blockquote", getHtmlContents(leafInfos.leaf.content)),
        renderNeighorLink("e", leafInfos.neighbors.rightBrother),
        renderNeighorLink("s", leafInfos.neighbors.parent)
      ])
}

/**
 * Convert HTML content to virtual dom elements
 *
 * @param {string} content HTML content
 * @return {array} Array of virtual dom elements
 */
function getHtmlContents(content){
  let wrapper = document.createElement('div')
  wrapper.innerHTML = content
  return [].map.call(wrapper.childNodes, (el => {
      switch (el.nodeName){
      case "#text": return el.nodeValue;
      case "EM": return h('em', el.innerHTML);
      default: return undefined;
      }
    }))
}
