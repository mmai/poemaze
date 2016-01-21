export function renderPdf(editionId){
  return h('div#maincontainer', [ 
      h('h2', "Edition"),
      h('a', {href: "#"}, `n° ${editionId}`),
    ]
  );
}

