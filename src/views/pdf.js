import {h} from 'cycle-snabbdom'
import {assetsDir} from 'settings'

export function renderPdf(editionId){
  let content = []
  if (editionId === "pending") {
    content = [
      h('div.ai-pdf-pending', [
          h('img', {attrs:{src:`${assetsDir}/ajax-loader.gif`, alt:"en cours de traitement..."}}),
          h("div", "Edition des documents...")
        ])
    ]
  } else {
    content = [
      h('h2', `Edition du parcours ${editionId}`),
      h("ul", [
          h("li", [h('a', {attrs:{rel: "external", download: `ArbreIntegral-${editionId}-couverture.jpg`, href: `/aibooks/ArbreIntegral-${editionId}-couverture.jpg`}}, `Télécharger la couverture`)]),
          h("li", [h('a', {attrs:{rel: "external", download: `ArbreIntegral-${editionId}.pdf`, href: `/aibooks/ArbreIntegral-${editionId}.pdf`}}, `Télécharger le contenu`)])
        ]),
      
    ]
  }

  return h('div.main-container', [ 
    h('div.navigate-content.ai-pdf', content),
    h("div.breadcrumb", [
      h('div', 'Edition du parcours')
    ])
  ]);
}
