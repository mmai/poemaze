//Adapted from https://github.com/cyclejs/todomvc-cycle/blob/master/src%2Fdrivers.js

import {Observable} from 'rx';

import {storageAvailable} from './utils';
const hasStorage = storageAvailable('localStorage');

export function makeLocalStorageSourceDriver(keyName) {
  const item = hasStorage?localStorage.getItem(keyName):"";
  return () => Observable.just(item);
}

export function makeLocalStorageSinkDriver(keyName) {
  return function (keyValue$) {
    keyValue$.subscribe(keyValue => {
        if (hasStorage){
          localStorage.setItem(keyName, keyValue);
        }
      });
  };
}
