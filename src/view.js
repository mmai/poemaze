/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {VizWidget} from './arbreintegralVizDriver';
var parser = require("vdom-parser");

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
  if (history.length == 126) {
    circlesView = renderEnd(leafInfos);
  } else {
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
  }

  return (
    <div id="maincontainer">
      <div>
        {h('ai-progression', {max:126, value:history.length})}
      </div>
      <a href="#reset">Remise à zéro</a><br/>
      <hr />
        {circlesView}
      <hr />
      <div id="dasboard">
        {new VizWidget()}
        <div id="history">
        <h2>Historique</h2>
        {h('ul', 
            history.map(url => h("li", [
                  h("a", {href: `#${url.id}`}, `${url.word} (${url.id})`)
                ])
            )
          )}
        </div>
      </div>
    </div>
    );
}

function renderRoot(leafInfos){
  return (
      <div id="ai-text">
        <div className="tree-breadcrumb">
        AI / {leafInfos.leaf.name}
        </div>
        <div className="circle">
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
        </div>

        <div id="circle-current" className="circle">
          <div id="circle-current--content">
          o
          </div>
        </div>

        <div className="circle">
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
        </div>
      </div>
      )
}

function renderEnd(){
  return (
      <div id="ai-text">
        <div>Imprimez votre parcours avec Blook-up</div>

        <div>
          <a href="#reset">Recommencer</a><br/>
        </div>

        <div>
        <ul>
          <li><a href="mailto:?subject=Arbre intégral&body=Explorez l'Arbre Intégral">Partager par email</a></li>
          <li><a href="https://www.facebook.com/sharer/sharer.php?u=http%3A//arbre-integral.net">Partager sur Facebook</a></li> 
          <li><a href="https://twitter.com/home?status=l'arbre%20int%C3%A9gral%20http%3A//arbre-integral.net">Partager sur Twitter</a></li>
        </ul>
        </div>
      </div>
      )
}

function renderLeafReversed(leafInfos){
  return renderLeafUpside(leafInfos);
}

function renderLeafUpside(leafInfos){
  // let hcontent = parser(leafInfos.leaf.content);
  return (
      <div id="ai-text">
        <div className="tree-breadcrumb">
        AI / {leafInfos.leaf.name}
        </div>
        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-children--left", leafInfos.neighbors.leftChild)}
          {renderNeighorLink("circle-children--right", leafInfos.neighbors.rightChild)}
        </div>

        <div id="circle-current" className="circle">
          {renderNeighorLink("circle-current--left", leafInfos.neighbors.leftBrother)}
          <div id="circle-current--content">
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

function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor){
    links.push(h('a', {href: "#" + neighbor.leaf.id + "-" + neighbor.fromId}, neighbor.leaf.word));
  }  
  return h("div#" + id, links);
}
