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
export function renderLeaf(isUpside, leafInfos, history){
  let circlesView = h("div");
  let interstice = (history.length == 1) ? renderInterstice(): ""

  // if (true) {
  if (history.length == 126) {
    circlesView = renderEnd(leafInfos);
  } else {
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
  }

      // {h('ai-progression', { max:126, value: history.length })}
  return (
    <div id="maincontainer">
      <div>
      {h('ai-progression', {
            value:history.map( leaf => {
                let elems = leaf.id.split('.');
                return (elems.length === 1) ? "" : (elems[1] === "0" )
              })
          })}
      </div>
      <a href="#reset">Recommencer</a><br/>
      <hr />
        {interstice}
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

function renderInterstice(){
  return (
    <div id="ai-interstice">
      L'arbre intégral par Donatien Garnier
    </div>
  )
}


function renderRoot(leafInfos){
  let leftchild = leafInfos.neighbors.leftChild;
  let rightchild = leafInfos.neighbors.rightChild;
  return (
      <div id="ai-text">
        <div className="tree-breadcrumb">
        AI / {leafInfos.leaf.name}
        </div>

        <div className="circle">
          <div id="circle-children--left">
          {h('a',
             {href: "#" + leftchild.leaf.id + "-" + leftchild.fromId},
              leftchild.leaf.word
            )}
          </div>
        </div>

        <div id="circle-current" className="circle">
          <div id="circle-current--content">
          ==oOo==
          </div>
        </div>

        <div className="circle">
          <div id="circle-children--right">
          {h('a',
             {href: "#" + rightchild.leaf.id + "-" + rightchild.fromId},
              rightchild.leaf.word
            )}
          </div>
        </div>
      </div>
      )
}

function renderEnd(leafInfos){
  return (
      <div id="ai-text">
        <div id="circle-current" className="circle">
          <div id="circle-current--content" >
          {parser(`<span class="ai-last">${leafInfos.leaf.content}</span>`)}
          </div>
        </div>
        <div><a href="#pdf">Conservez le livre de votre parcours</a></div>

        <div>
          <a href="#reset">Recommencer</a><br/>
        </div>

      </div>
      )
}

function renderLeafReversed(leafInfos){
  let circleLevel = leafInfos.leaf.id.split('.').length - 1;
  return (
      <div id="ai-text" className={"circle-" + circleLevel}>
        <div className="tree-breadcrumb">
        AI / {leafInfos.leaf.name}
        </div>

        <div id="circle-children" className="circle">
          {renderNeighorLink("circle-parent", leafInfos.neighbors.parent)}
        </div>

        <div id="circle-current" className="circle">
          {renderNeighorLink("circle-current--left", leafInfos.neighbors.leftBrother)}
          <div id="circle-current--content">
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
  let circleLevel = leafInfos.leaf.id.split('.').length - 1;
  return (
      <div id="ai-text" className={"circle-" + circleLevel}>
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
