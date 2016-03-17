/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp} from './utils'
import {pagesUrl} from 'settings'

export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  //We can't put the link directly on a.dashboardLink du to a cycle-dom bug on internet explorer
  const currentLeafId = history.length === 0 ? "0" : history[history.length-1].id;
  return (

    <aside id="side-panel" className={showDashboard?"active":"no"}>
      <a id="dashboardToggle" href={showDashboard?"#main":"#dashboard"}></a>
      {h("a.dashboardLink", {attributes: {onclick: "document.getElementById('dashboardToggle').click()"}}, [aiLogoSvgVtree])}

		  <div className="side-panel-content">
        <div className="location">{currentLeafId}</div>

        {aiSvgVtree}

        {progressionVtree}
        {h("script", `function aiOpenMenu(e){ document.getElementById(e.dataset.target).classList.toggle('active'); }`)}
        {h('ul.navigation', [
            h("li", [
              buttonForList("historyList", "Historique"),
              h('ul#historyList', history.map(url =>
                h(`li.${isUp(url)?'ai-up':'ai-down'}`, [ h(`a`, {href: `/${url.id}`}, `${url.word} (${url.id})`) ])
              ))
            ]),
            h("li", [
              buttonForList("livreList", "Livre"),
              h('ul#livreList', [
                  h("li", [h("a", {rel: "external", href: "/genese"}, "Genèse")]),
              ])
            ]),
            h("li", [
              buttonForList("spectacleList", "Spectacle"),
              h('ul#spectacleList', [
                  h("li", [h("a", {rel: "external", href: "/genese"}, "Genèse")]),
              ])
            ]),
            h("li", [
              buttonForList("forumList", "Forum"),
              h('ul#forumList', [
                  h("li", [h("a", {rel: "external", href: pagesUrl + '/forums/forum/suggestions'}, "Suggestions" )]),
              ])
            ]),
            h("li", [
              buttonForList("partenairesList", "Partenaires"),
              h('ul#partenairesList', [
                  h("li", [h("a", {rel: "external", href: "/genese"}, "Genèse")]),
              ])
            ]),
            h("li", [h("a", {rel: "external", href: "/contact"}, "Contact")]),
            h("li", [h("a", {href: "/reset"}, "Recommencer")]),
          ])}
        <a rel="external" className="about-link" href={pagesUrl + '/propos'} title="Propos">
          <img src="/wp-content/themes/arbre-integral/img/assets/logo-home.svg" alt="Logo" />
        </a>
      </div>
    </aside>
    );
}

function buttonForList(listElement, caption){
  return h('button.trigger.reset', { attributes: { type:"button", onclick:"aiOpenMenu(this)", "data-target": listElement}}, caption)
}
