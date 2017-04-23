import firstNames from './firstNames'
import lastNames from './lastNames'

export function random(array) {
  let i = Math.floor(Math.random() * array.length)
  return array[i]
}

export const fullName = () => {
  const firstName = random(firstNames)
  const lastName = random(lastNames)
  return `${firstName} ${lastName}`
}
