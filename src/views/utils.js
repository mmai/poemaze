import {h} from '@cycle/dom';

export function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor){
    let classUp = isUp(neighbor.leaf)?"ai-word--up":"ai-word--down";
    links.push(h(`a.${classUp}`, {href: "#" + neighbor.leaf.id + "-" + neighbor.fromId}, neighbor.leaf.word));
  }  
  return h("div.ai-word#" + id, links);
}

export function isUp (leaf){
  if (!leaf.id) return true;
  return leaf.id.split('.')[1] === '0';
}
