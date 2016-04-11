import {h} from 'cycle-snabbdom'
import {isUp} from './utils'
import {pagesUrl} from 'settings'
import {assetsDir} from 'settings'

export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  //We can't put the link directly on a.dashboardLink du to a cycle-dom bug on internet explorer
  const currentLeafId = history.length === 0 ? "0" : history[history.length-1].id;
  return h("aside#side-panel", {class: {active: showDashboard}}, [
      // h("a#dashboardToggle", {href: showDashboard?"#main":"#dashboard"}),
      // h("a.dashboardLink", {attrs: {onclick: "document.getElementById('dashboardToggle').click()"}}, [h("div.svgLogoContainer", [aiLogoSvgVtree])]),
      h("a.dashboardLink", {attrs: {href: showDashboard?"#main":"#dashboard"}}, [h("div.svgLogoContainer", [aiLogoSvgVtree])]),
      h("div.side-panel-content", [
          h("div.location", currentLeafId),
          aiSvgVtree,
          progressionVtree,
          h("script", `
            function aiOpenMenu(e){ document.getElementById(e.dataset.target).classList.toggle('active'); }
            function askFullScreen(){
              document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;

              function requestFullscreen(element) {
                if (element.requestFullscreen) {
                  element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                  element.mozRequestFullScreen();
                } else if (element.webkitRequestFullScreen) {
                  element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }
              }

              if (document.fullscreenEnabled){
                requestFullscreen(document.querySelector('html'));
              } else {
                alert('Plein écran impossible avec ce navigateur');
              }
            }
            `),
        h('ul.navigation', [
            h("li", [
              buttonForList("historyList", "Historique"),
              h('ul#historyList', history.map(url =>
                h(`li.${isUp(url)?'ai-up':'ai-down'}`, [ h(`a`, {attrs: {href: `/${url.id}`}}, `${url.word} (${url.id})`) ])
              ))
            ]),
            h("li", [
              buttonForList("livreList", "Livre"),
              h('ul#livreList', [
                  h("li", [h("a", {attrs:{rel: "external", href: "/livre/genese/"}}, "Genèse")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/livre/numerique/"}}, "Numérique")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/livre/open-source/"}}, "Open source")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/livre/graphisme/"}}, "Graphisme")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/livre/developpement/"}}, "Développement")]),
              ])
            ]),
            h("li", [
              buttonForList("spectacleList", "Spectacle"),
              h('ul#spectacleList', [
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/concept/"}}, "Concept")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/video/"}}, "Images")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/decor-3d/"}}, "Décor 3D")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/danse/"}}, "Danse")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/bande-son/"}}, "Bande-son")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/technologies/"}}, "Technologies")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/un-spectacle-en-realite-augmentee/mediation/"}}, "Médiation")]),
              ])
            ]),
            h("li", [
              buttonForList("equipesList", "Équipes"),
              h('ul#equipesList', [
                  h("li", [h("a", {attrs:{rel: "external", href: "/equipe/lauteur/"}}, "L'auteur")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/equipe/livre/"}}, "Web")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/equipe/scene/"}}, "Scène")]),
              ])
            ]),
            h("li", [
              buttonForList("partenairesList", "Partenaires"),
              h('ul#partenairesList', [
                  h("li", [h("a", {attrs:{rel: "external", href: "/partenaires/livre-spectacle/"}}, "Livre & spectacle")]),
                  h("li", [h("a", {attrs:{rel: "external", href: "/partenaires/remerciements/"}}, "Remerciements")]),
              ])
            ]),
            h("li", [
              buttonForList("forumList", "Forum"),
              h('ul#forumList', [
                  h("li", [h("a", {attrs:{rel: "external", href: pagesUrl + '/forums/forum/suggestions'}}, "Suggestions" )]),
              ])
            ]),
            h("li", [h("a", {attrs:{rel: "external", href: "/acceuillir-le-spectacle/"}}, "Contacts")]),
            h("li", [h("a", {attrs:{href: "/reset"}}, "Recommencer")]),
            h("li", [h("a", {attrs:{onclick: "askFullScreen()", href: "#"}}, "Plein écran")]),
          ]),
        h("a.about-link", {attrs: {rel:"external", href: pagesUrl + '/propos', title: "Propos"}}, [
            h('img', {attrs:{src:`${assetsDir}/logo-home.svg`, alt:"Logo L'Arbre Intégral"}}),
          ])
      ])
  ])
}

function buttonForList(listElement, caption){
  return h('button.trigger.reset', { attrs: { type:"button", onclick:"aiOpenMenu(this)", "data-target": listElement}}, caption)
}
