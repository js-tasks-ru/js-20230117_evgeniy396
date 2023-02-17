/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return ''
  } else if (!size) {
    return string
  }

  const arrStr = string.split('')
  const result = arrStr.reduce((accum, el) => {
    if (accum.length === 0 || accum[accum.length - 1][0] !== el) {
      accum.push(el)
    } else if (accum[accum.length - 1][0] === el && accum[accum.length - 1].length < size) {
      accum[accum.length - 1] += el
    }
    return accum
  }, []).join('')
  return result
}
