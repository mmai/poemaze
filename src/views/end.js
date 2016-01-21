/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';

export function renderEnd(leafInfos){
  return (
      <div className="ai-text">
        <div id="circle-current" className="circle">
          <div className="circle-current--content" >
          <span class="ai-last">{leafInfos.leaf.content}</span>
          </div>
        </div>
        <div><a href="#pdf">Conservez le livre de votre parcours</a></div>

        <div>
          <a href="#reset">Recommencer</a><br/>
        </div>

      </div>
      )
}

