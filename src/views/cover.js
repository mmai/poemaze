/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';

export function renderCover(){
  return (
    <div id="ai-cover">
      <img src="/wp-content/themes/arbre-integral/couverture.png"/>
      <div>par</div>
      <div className="ai-cover--author">Donatien Garnier</div>
      <div className="ai-cover--credits">graphisme Franck Tallon</div>
    </div>
  )
}

export function renderRoot(leafInfos){
  let leftchild = leafInfos.neighbors.leftChild;
  let rightchild = leafInfos.neighbors.rightChild;

  let linkUp = leftchild.leaf.id + "?trace=" + leftchild.fromId;
  let linkDown = rightchild.leaf.id + "?trace=" + rightchild.fromId;
  return (
      <div className="ai-root ai-text">
        <div className="circle">
          <table>
            <tr>
              <td></td>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>E</a></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>L</a></td>
              <td></td>
              <td><a className='ai-seed-up' href={linkUp}>N</a></td>
              <td></td>
            </tr>
            <tr>
            <td style="text-align:right;"><a className='ai-seed-up' href={linkUp}>H</a></td>
              <td></td>
              <td style="width:2em;height:2em;">O</td>
              <td></td>
              <td style="text-align:left;"><a className='ai-seed-down' href={linkDown}>M</a></td>
            </tr>
            <tr>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>I</a></td>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>G</a></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td><a className='ai-seed-down' href={linkDown}>R</a></td>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
      )
}

