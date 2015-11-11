/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {VizWidget} from './arbreintegralVizDriver';

export function renderDashboard(){
  return h('div#maincontainer', [ 
      h('h2', "Tableau de bord"),
      h('a', {href: "#"}, "Lire"),
      // new AiTwoWidget({ width: 285, height: 200 }),
      // new AiTwoWidget(AI, {fullscreen:true})
      // new AiTwoWidget(AI)
    ]
  );
}

// export function renderLeaf(leafInfos){
export function renderLeaf(leafInfos, history){
  let circlesView = h("div");
  switch(leafInfos.type){
  case 'ROOT':
    circlesView = renderRoot(leafInfos);
    break;
  case 'DOWN': 
    circlesView = renderLeafReversed(leafInfos);
    break;
  default: 
    circlesView = renderLeafUpside(leafInfos);
  }

  return (
    <div id="maincontainer">
      <a href="#reset">Remise à zéro</a><br/>
      <hr />
        {circlesView}
      <hr />
      <div id="dasboard">
        {new VizWidget()}
        <div id="history">
        {h('ul', history.map(url => h("li", `${url.word} (${url.id})`)))}
        </div>
      </div>
    </div>
    );
}

function renderRoot(leafInfos){
  return (
      <div id="ai-text">
        <div className="tree-breadcrumb">
        AI/{leafInfos.leaf.id}
        </div>
        <div className="circle">
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
        </div>

        <div id="circle-current" className="circle">
          <div id="circle-current--content">
            {leafInfos.leaf.content}
          </div>
        </div>

        <div className="circle">
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
        </div>
      </div>
      )
}

function renderLeafReversed(leafInfos){
  return renderLeafUpside(leafInfos);
}

function renderLeafUpside(leafInfos){
  return (
      <div id="ai-text">
        <div className="tree-breadcrumb">
        AI/{leafInfos.leaf.id}
        </div>
        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
        </div>

        <div id="circle-current" className="circle">
          {renderNeighorLink("circle-current--left", leafInfos.neighbors.leftBrother)}
          <div id="circle-current--content">
            {leafInfos.leaf.content}
          </div>
          {renderNeighorLink("circle-current--right", leafInfos.neighbors.rightBrother)}
        </div>

        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-parent", leafInfos.neighbors.parent)}
        </div>
      </div>
      );
    }

function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor){
    links.push(h('a', {href: "#" + neighbor.leaf.id + "-" + neighbor.fromId}, neighbor.leaf.word));
  }  
  return h("div#" + id, links);
}
