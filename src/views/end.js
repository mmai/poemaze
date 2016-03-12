/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';
import {renderShare} from './share'

export function renderEnd(leafInfos){
  return (
      <div className="main-container">
        <div className="navigate-content ai-last">
          <div className="ai-last-text">{leafInfos.leaf.content}</div>
          <img className="ai-last-cross" src="/wp-content/themes/arbre-integral/img/assets/cross.svg" />
          <div className="ai-last-save"><a href="/pdf">Sauvegarder le livre</a></div>
        </div>
        <div className="breadcrumb">
          <div>{leafInfos.leaf.name}</div>
        </div>
        <div className="ai-last-restart"><a href="/reset">Recommencer</a></div>
      </div>
      )
}

