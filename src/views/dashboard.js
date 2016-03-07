/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {isUp} from './utils'
import {pagesUrl} from 'settings'

      // <a href={showDashboard?"#main":"#dashboard"} className='dashboardLink'>
      // <aside id="side-panel" className={showDashboard?"ai-opened":"ai-closed"}>
      // <button className="swicth-btn trigger" data-target="side-panel"> </button>
export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  return (
    <aside id="side-panel" className={showDashboard?"active":""}>
      <a href={showDashboard?"#main":"#dashboard"} className='swicth-btn'>
        {aiLogoSvgVtree}
      </a>

		  <div className="side-panel-content">
        <div className="location">0.1.2.2.2.2.1</div>
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
              history.map(url => h(`li.${isUp(url)?'blue':'brown'}`, [
                    h(`a`, {href: `${url.id}`}, `${url.word} (${url.id})`)
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
        </ul>
      </div>
    </aside>
    );
}
