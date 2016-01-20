/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {VizWidget} from './arbreintegralVizDriver';
import {LogoVizWidget} from './arbreintegralVizDriver';
var parser = require("vdom-parser");

let aiDomain = 'http://arbre-integral.net';

export function renderPdf(editionId){
  return h('div#maincontainer', [ 
      h('h2', "Edition"),
      h('a', {href: "#"}, `n° ${editionId}`),
    ]
  );
}

// export function renderLeaf(leafInfos){
export function renderLeaf(showDashboard, isUpside, leafInfos, history){
  let circlesView = h("div");
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

  let dashboardView = (history.length > 0 || window.aiPageType === "wordpress") ? renderDashboard(showDashboard, isUpside, history) : renderInterstice();

  if (window.aiPageType === "wordpress") {
    //Only the cyclejs dashboard
    return ( <div id="maincontainer"> {dashboardView} </div>);
  }

  return (
    <div id="maincontainer">
      {circlesView}
      {dashboardView}
    </div>
  );

      // {h('ai-progression', { max:126, value: history.length })}
}

function renderDashboard(showDashboard, isUpside, history){
  return (
      <div id="dashboard" className={showDashboard?"ai-opened":"ai-closed"}>
        <a href={showDashboard?"#main":"#dashboard"} className='dashboardLink'>
          {new LogoVizWidget()}
        </a>
        <a href="#reset">Recommencer</a><br/>
        {new VizWidget()}

        {h('ai-progression', {
              value:history.map( leaf => {
                  let elems = leaf.id.split('.');
                  return (elems.length === 1) ? "" : (elems[1] === "0" )
                })
            })}

        <div id="Forum">
          <h2><a rel="external" href={aiDomain + '/forums/forum/suggestions'}>Forum</a></h2>
       </div>
        <div id="history">
          <h2>Historique</h2>
          {h('ul', 
              history.map(url => h("li", [
                    h(`a.${isUp(url)?'ai-word--up':'ai-word--down'}`, {href: `#${url.id}`}, `${url.word} (${url.id})`)
                  ])
              )
            )}
        </div>

      </div>
    );
}

function renderInterstice(){
  return (
    <div id="ai-interstice">
      <img src="/wp-content/themes/arbre-integral/couverture.png"/>
      <div>par</div>
      <div className="ai-cover--author">Donatien Garnier</div>
      <div className="ai-cover--credits">graphisme Franck Tallon</div>
    </div>
  )
}


function renderRoot(leafInfos){
  let leftchild = leafInfos.neighbors.leftChild;
  let rightchild = leafInfos.neighbors.rightChild;

  let linkUp = "#" + leftchild.leaf.id + "-" + leftchild.fromId;
  let linkDown = "#" + rightchild.leaf.id + "-" + rightchild.fromId;
  return (
      <div className="ai-root ai-text">
        <div className="circle">
          <table>
            <tr>
              <td></td>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>E</a></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>L</a></td>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>N</a></td>
              <td></td>
            </tr>
            <tr>
            <td style="text-align:right;"><a className='ai-seed-up' href={linkUp}>H</a></td>
              <td></td>
              <td style="width:2em;height:2em;">O</td>
              <td></td>
              <td style="text-align:left;"><a className='ai-seed-down' href={linkDown}>M</a></td>
            </tr>
            <tr>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>I</a></td>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>G</a></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>R</a></td>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
      )
}

function renderEnd(leafInfos){
  return (
      <div className="ai-text">
        <div id="circle-current" className="circle">
          <div className="circle-current--content" >
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

function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor){
    let classUp = isUp(neighbor.leaf)?"ai-word--up":"ai-word--down";
    links.push(h(`a.${classUp}`, {href: "#" + neighbor.leaf.id + "-" + neighbor.fromId}, neighbor.leaf.word));
  }  
  return h("div.ai-word#" + id, links);
}

function isUp (leaf){
  if (!leaf.id) return true;
  return leaf.id.split('.')[1] === '0';
}
