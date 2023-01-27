/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrPath = path.split('.')
  function getterObj (obj) {
    const res = arrPath.reduce((accum, key) => {
      return accum === undefined ? accum : accum[key]
    }, obj)
    return res
  }

  return getterObj
}
