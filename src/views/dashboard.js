/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp} from './utils'
import {pagesUrl} from 'settings'

export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  const currentLeafId = history.length === 0 ? "0" : history[history.length-1].id;
  return (
    <aside id="side-panel" className={showDashboard?"active":""}>
      <a href={showDashboard?"#main":"#dashboard"} className='dashboardLink'>
        {aiLogoSvgVtree}
      </a>

		  <div className="side-panel-content">
        <div className="location">{currentLeafId}</div>
        <a href="reset">Recommencer</a><br/>

        {aiSvgVtree}

        {progressionVtree}

			<ul className="navigation">
				<li>
          {h('button.trigger.reset', {
                attributes: {type:"button", "onclick": "document.getElementById('historyList').classList.toggle('active')" },
           }, 
           "Historique"
         )}
          {h('ul#historyList', 
              history.map(url => h(`li.${isUp(url)?'ai-up':'ai-down'}`, [
                    h(`a`, {href: `/${url.id}`}, `${url.word} (${url.id})`)
                  ])
              )
            )}
				</li>
				<li>
					<a href="#">Livre</a>
				</li>
				<li>
					<a href="#">Spectacle</a>
				</li>
				<li>
          <a rel="external" href={pagesUrl + '/forums/forum/suggestions'}>Forum</a>
				</li>
				<li>
					<a href="#">Partenaires</a>
				</li>
				<li>
					<a href="#">Contact</a>
				</li>
				<li>
					<a href="#">Partager</a>
				</li>
				<li>
					<a rel="external"  href={pagesUrl + '/propos'}>PROPOS</a>
				</li>
        </ul>
      </div>
    </aside>
    );
}
