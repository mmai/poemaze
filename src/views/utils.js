import {h} from 'cycle-snabbdom'

export function renderNeighorLink(id, neighbor){
  let links = [];
  if (neighbor && neighbor.leaf){
    let classUp = isUp(neighbor.leaf)?"ai-up":"ai-down";
    links.push(h(`a.${classUp}`, {attrs:{href: neighbor.leaf.id + "?trace=" + neighbor.fromId}}, neighbor.leaf.word));
  }  
  if (links.length === 0) {
    links = [h("a.txt-transparent", ".")]
  }
  return h("span.item-" + id, links);
}

export function isUp (leaf){
  if (!leaf.id) return true;
  return leaf.id.split('')[1] === '0';
}
