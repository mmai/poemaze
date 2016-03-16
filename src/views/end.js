/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {renderShare} from './share'

export function renderEnd(leafInfos){
  return (
	<div className="main-container">
		<div className="end-content">
			<div className="end-cross">
        <div className="end-text">
          {leafInfos.leaf.content}
        </div>
				<img src="/wp-content/themes/arbre-integral/img/assets/cross.svg"/>
			</div>
			<a href="/pdf">Sauvegarder le livre</a>
		</div>
        <div className="breadcrumb">
          <div>{leafInfos.leaf.name}</div>
        </div>
        <div className="ai-last-restart"><a href="/reset">Recommencer</a></div>
	</div>

      )
}

