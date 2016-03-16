/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';

export function renderCover(){
  return (
	<div className="main-container">
		<div className="home-content">
			<img className="home-logo" src="/wp-content/themes/arbre-integral/img/assets/logo-home.svg" alt="Logo L'Arbre Intégral"/>
			<div className="home-title">
				<div className="first-line">par</div>
				<div className="second-line">Donatien Garnier</div>
				<div className="third-line">graphisme Franck Tallon</div>
			</div>
		</div>
    </div>
  )
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
                  h("span.n", [ h("a.ai-up", {attributes: {"href": linkUp}}, "E") ]),
                  h("span.nw", [ h("a.ai-up", {attributes: {"href": linkUp}}, "L") ]),
                  h("span.ne", [ h("a.ai-up", {attributes: {"href": linkUp}}, "N") ]),
                  h("span.w", [ h("a.ai-up", {attributes: {"href": linkUp}}, "H") ]),
                  h("span.c", [ h("a.pink.big", {attributes: {"href": "/", "onclick": replayCover}}, "0") ]),
                  h("span.e", [ h("a.ai-down", {attributes: {"href": linkDown}}, "M") ]),
                  h("span.sw", [ h("a.ai-down", {attributes: {"href": linkDown}}, "I") ]),
                  h("span.se", [ h("a.ai-down", {attributes: {"href": linkDown}}, "G") ]),
                  h("span.s", [ h("a.ai-down", {attributes: {"href": linkDown}}, "R") ])
                ])
            ])
        ])
    ])
}

