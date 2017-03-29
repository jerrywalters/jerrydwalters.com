import firstNames from './firstNames';
import lastNames from './lastNames';

export function random(array) {
  var i = Math.floor(Math.random() * array.length);
  return array[i];
}

export var fullName = () => random(firstNames) + ' ' + random(lastNames)
