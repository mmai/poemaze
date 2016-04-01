// require('./classList.js') //classList polyfill 
import {Observable} from 'rx';

export default function makeBodyStylesDriver() {
  return function bodyStyleDriver(sink$) {
    sink$.subscribe(s => {
        for (let c of s.classes.toRemove){ document.body.classList.remove(c) }
        for (let c of s.classes.toAdd){ document.body.classList.add(c) }
        // document.body.classList.add(...(s.classes.toAdd))//not working on android 4.2
      })
  }
}
