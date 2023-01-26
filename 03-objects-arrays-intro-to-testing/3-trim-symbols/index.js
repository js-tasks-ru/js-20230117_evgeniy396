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
  const result = []
  arrStr.forEach((item) => {
    if (result.length === 0 || result[result.length - 1][0] !== item) {
      result.push(item)
    } else if (result[result.length - 1][0] === item && result[result.length - 1].length < size) {
      result[result.length - 1] += item
    }
  })
  return result.join('')
}
