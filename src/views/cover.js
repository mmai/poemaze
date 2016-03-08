/** @jsx hJSX */

import {hJSX, h} from '@cycle/dom';

export function renderCover(){
  return (
	<div className="main-container">
		<div className="home-content">
			<img className="home-logo" src="/wp-content/themes/arbre-integral/img/assets/logo-home.svg" alt="Logo L'Arbre Intégral"/>
			<div className="home-title">
				<div className="first-line">par</div>
				<div className="second-line">Donatien Garnier</div>
				<div className="third-line">graphisme Franck Tallon</div>
			</div>
		</div>
    </div>
  )
}

export function renderRoot(leafInfos){
  let leftchild = leafInfos.neighbors.leftChild;
  let rightchild = leafInfos.neighbors.rightChild;

  let linkUp = leftchild.leaf.id + "?trace=" + leftchild.fromId;
  let linkDown = rightchild.leaf.id + "?trace=" + rightchild.fromId;
  return (
	<div className="main-container start-page">
		<div className="start-content">
			<div className="start-square">
				<div className="start-inner">
					<span className="n"><a className="ai-up" href={linkUp}>E</a></span>
					<span className="nw"><a className="ai-up" href={linkUp}>L</a></span>
					<span className="ne"><a className="ai-up" href={linkUp}>N</a></span>
					<span className="w"><a className="ai-up" href={linkUp}>H</a></span>
					<span className="c"><a className="pink big">0</a></span>
					<span className="e"><a className="ai-down" href={linkDown}>M</a></span>
					<span className="sw"><a className="ai-down" href={linkDown}>I</a></span>
					<span className="se"><a className="ai-down" href={linkDown}>G</a></span>
					<span className="s"><a className="ai-down" href={linkDown}>R</a></span>
				</div>
			</div>
		</div>
	</div>
      )
}
      // <div className="ai-root ai-text">
      //   <div className="circle">
      //     <table>
      //       <tr>
      //         <td></td>
      //         <td></td>
      //         <td><a className='ai-seed-up' href={linkUp}>E</a></td>
      //         <td></td>
      //         <td></td>
      //       </tr>
      //       <tr>
      //         <td></td>
      //         <td><a className='ai-seed-up' href={linkUp}>L</a></td>
      //         <td></td>
      //         <td><a className='ai-seed-up' href={linkUp}>N</a></td>
      //         <td></td>
      //       </tr>
      //       <tr>
      //       <td style="text-align:right;"><a className='ai-seed-up' href={linkUp}>H</a></td>
      //         <td></td>
      //         <td style="width:2em;height:2em;">O</td>
      //         <td></td>
      //         <td style="text-align:left;"><a className='ai-seed-down' href={linkDown}>M</a></td>
      //       </tr>
      //       <tr>
      //         <td></td>
      //         <td><a className='ai-seed-down' href={linkDown}>I</a></td>
      //         <td></td>
      //         <td><a className='ai-seed-down' href={linkDown}>G</a></td>
      //         <td></td>
      //       </tr>
      //       <tr>
      //         <td></td>
      //         <td></td>
      //         <td><a className='ai-seed-down' href={linkDown}>R</a></td>
      //         <td></td>
      //         <td></td>
      //       </tr>
      //     </table>
      //   </div>
      // </div>
      //
