import {h} from '@cycle/dom';

export function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor){
    let classUp = isUp(neighbor.leaf)?"blue":"brown";
    links.push(h(`a.${classUp}`, {href: neighbor.leaf.id + "?trace=" + neighbor.fromId}, neighbor.leaf.word));
  }  
  return h("span.item-" + id, links);
}

export function isUp (leaf){
  if (!leaf.id) return true;
  return leaf.id.split('')[1] === '0';
}
