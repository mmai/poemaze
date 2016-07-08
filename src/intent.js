import {filterLinks } from '@cycle/history';

export default function intent(DOM, History){
    //TODO optimiser en remplaçant les filters par un GroupBy (http://reactivex.io/documentation/operators/groupby.html)
  const navigationClick$ = DOM
  .select('a')
  .events('click')
  .filter(filterLinks)
  .map(event =>  {
      // const target = event.currentTarget //dont work on ie
      const target = event.ownerTarget
      const pathname = target.pathname.slice(target.pathname.lastIndexOf("/") + 1)
      const from = getParameterByName("trace", target.search)
      const display = target.hash.slice(1) 
      return { pathname, from, display }
    })
  .share()

  // Clicks on the SVG nodes
  const svgClick$ = DOM.select('[data-neighbor-href]').events('click')
  .map(ev => {
      return ev.target.getAttribute('data-neighbor-href')
    })
  .filter(href => href != null) 
  .map(href => {
      let [pathname, from] = href.split('-');
      return { pathname, from }
    })
  .share()

  // Submit new source form
  const submitSource$    = DOM.select('#newsource-form--submit').events('click').map(
    (click) => {
      return document.getElementById('newsource-form--textarea').value
    }
  )

  const reset$           = navigationClick$.filter(click => click.pathname === "reset")
  const makePdf$         = navigationClick$.filter(click => click.pathname === "pdf")
  const chooseSource$    = navigationClick$.filter(click => click.pathname === "newsource")
  const showJourney$     = navigationClick$.filter(click => click.pathname === "journey")
  const dashboardOpen$   = navigationClick$.filter(click => click.display === "dashboard")
  const dashboardClose$  = navigationClick$.filter(click => click.display === "main")
  const gotoPoem$        = navigationClick$.filter(click => (
      ["reset", "pdf"].indexOf(click.pathname) === -1 && 
      ["dashboard", "main"].indexOf(click.display) === -1 
    ))
  .merge(svgClick$)
  .map(click => {
      let url = `/${click.pathname}`
      if ((undefined !== click.from) && (null !== click.from)){
        url += `?trace=${click.from}`
      }
      return url
    })
  .share()

  const readPoem$ = History
  .map(h => ({ 
        pathname: h.pathname.slice(1),
        from: h.query.trace,
        display: h.hash.slice(1) 
      }))
  .filter(h => "0" === h.pathname.slice(0,1) && "" === h.display)
  .shareReplay()

  return {
    reset$,
    makePdf$,
    chooseSource$,
    submitSource$,
    showJourney$,
    dashboardOpen$,
    dashboardClose$,
    gotoPoem$,
    readPoem$
  }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
