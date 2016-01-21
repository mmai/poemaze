/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {VizWidget} from '../arbreintegralVizDriver';
import {LogoVizWidget} from '../arbreintegralVizDriver';
import {isUp} from './utils'

let aiDomain = 'http://arbre-integral.net';

export function renderDashboard(showDashboard, isUpside, history){
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
