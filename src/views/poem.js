/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp, renderNeighorLink} from './utils'
import {renderRoot} from './cover'
var parser = require("vdom-parser");

// export function renderLeaf(leafInfos){
export function renderPoem(showDashboard, isUpside, leafInfos){
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

function renderLeafReversed(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('.').length - 1;
  return (
      <div className={"ai-text circle-" + circleLevel + " " + classUp}>
        <div>
         <span className="tree-breadcrumb">{leafInfos.leaf.name}</span>
        </div>

        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-parent", leafInfos.neighbors.parent)}
        </div>

        <div id="circle-current" className="circle">
          {renderNeighorLink("circle-current--left", leafInfos.neighbors.leftBrother)}
          <div className="circle-current--content">
          {parser(`<span>${leafInfos.leaf.content}</span>`)}
          </div>
          {renderNeighorLink("circle-current--right", leafInfos.neighbors.rightBrother)}
        </div>

        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
        </div>
      </div>
    );
}

function renderLeafUpside(leafInfos){
  let classUp = (leafInfos.type === "UP") ? "ai-up" : "ai-down";
  let circleLevel = leafInfos.leaf.id.split('.').length - 1;
  return (
      <div className={"ai-text circle-" + circleLevel + " " + classUp}>
        <div>
         <span className="tree-breadcrumb">{leafInfos.leaf.name}</span>
        </div>
        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
        </div>

        <div id="circle-current" className="circle">
          {renderNeighorLink("circle-current--left", leafInfos.neighbors.leftBrother)}
          <div className="circle-current--content">
          {parser(`<span>${leafInfos.leaf.content}</span>`)}
          </div>
          {renderNeighorLink("circle-current--right", leafInfos.neighbors.rightBrother)}
        </div>

        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-parent", leafInfos.neighbors.parent)}
        </div>
      </div>
      );
    }

