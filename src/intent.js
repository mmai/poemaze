import {filterLinks } from '@cycle/history';

export default function intent(DOM){
    //TODO optimiser en remplaçant les filters par un GroupBy (http://reactivex.io/documentation/operators/groupby.html)
  const navigationClick$ = DOM
  .select('a')
  .events('click')
  .filter(filterLinks)
  .map(event =>  {
      let [pathname, from] = event.currentTarget.hash.slice(1).split('-');
      return { pathname: pathname, from: from };
    })
  .share()

  // Clicks on the SVG nodes
  const svgClick$ = DOM.select('svg').events('click')
  .map(ev => ev.target.getAttribute('data-neighbor-href'))
  .filter(href => href != null) 
  .map(href => {
      let [pathname, from] = href.split('-');
      return { pathname, from }
    })
  .share()

  const reset$           = navigationClick$.filter(click => click.pathname === "reset")
  const makePdf$         = navigationClick$.filter(click => click.pathname === "pdf")
  const dashboardOpen$   = navigationClick$.filter(click => click.pathname === "dashboard")
  const dashboardClose$  = navigationClick$.filter(click => click.pathname === "main")
  // const dashboardClose$  = navigationClick$.do(()=>{console.log('[dashboarClose] before filter')}).filter(click => click.pathname === "main")
  const readPoem$        = navigationClick$
  .filter(click => ["reset", "pdf", "dashboard", "main"].indexOf(click.pathname) === -1)
  .merge(svgClick$)
  .share()

  return {
    reset$,
    makePdf$,
    dashboardOpen$,
    dashboardClose$,
    readPoem$
  }
}
