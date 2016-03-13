import {h} from '@cycle/dom'

export function renderPdf(editionId){
  let content = []
  if (editionId === "pending") {
    content = [
      h('div.ai-pdf-pending', [
          h('img', {src: "/wp-content/themes/arbre-integral/img/assets/spinner.svg"}),
          h("br"),
          "Edition des documents...",
        ])
    ]
  } else {
    content = [
      h('h2', `Edition du parcours ${editionId}`),
      h('a', {rel: "external", download: `ArbreIntegral-${editionId}-couverture.pdf`, href: `/aibooks/ArbreIntegral-${editionId}-couverture.pdf`}, `Télécharger la couverture`),
      h('a', {rel: "external", download: `ArbreIntegral-${editionId}.pdf`, href: `/aibooks/ArbreIntegral-${editionId}.pdf`}, `Télécharger le contenu`)
    ]
  }

  return h('div.main-container', [ 
    h('div.navigate-content.ai-pdf', content),
    h("div.breadcrumb", [
      h('div', 'Edition du parcours')
    ])
  ]);
}
