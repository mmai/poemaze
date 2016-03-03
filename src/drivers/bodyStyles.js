require('./classList.js') //classList polyfill 
import {Observable} from 'rx';

export default function makeBodyStylesDriver() {
  return function bodyStyleDriver(sink$) {
    sink$.subscribe(s => {
        document.body.classList.remove(...(s.classes.toRemove))
        document.body.classList.add(...(s.classes.toAdd))
      })
  }
}
