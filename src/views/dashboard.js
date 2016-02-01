/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp} from './utils'
import {pagesUrl} from 'settings'

export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  return (
      <div id="dashboard" className={showDashboard?"ai-opened":"ai-closed"}>
        <a href={showDashboard?"#main":"#dashboard"} className='dashboardLink'>
          {aiLogoSvgVtree}
        </a>
        <a href="#reset">Recommencer</a><br/>
        {aiSvgVtree}

        {progressionVtree}

        <ul className="dashboard--menu">
          <li><a rel="external" href={pagesUrl + '/forums/forum/suggestions'}>Forum</a></li>
          <li> Historique
          {h('ul#history', 
              history.map(url => h("li", [
                    h(`a.${isUp(url)?'ai-word--up':'ai-word--down'}`, {href: `#${url.id}`}, `${url.word} (${url.id})`)
                  ])
              )
            )}
          </li>
        </ul>
      </div>
    );
}
