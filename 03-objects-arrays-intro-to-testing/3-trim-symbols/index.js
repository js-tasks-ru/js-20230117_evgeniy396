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
  // первый вариант через forEach
  // const arrStr = string.split('')
  // const result = []
  // arrStr.forEach((item) => {
  //   if (result.length === 0 || result[result.length - 1][0] !== item) {
  //     result.push(item)
  //   } else if (result[result.length - 1][0] === item && result[result.length - 1].length < size) {
  //     result[result.length - 1] += item
  //   }
  // })
  // return result.join('')

  // второй вариант через reduce()
  const arrStr = string.split('')
  const result = arrStr.reduce((accum, el) => {
    if (accum.length === 0 || accum[accum.length - 1][0] !== el) {
      accum.push(el)
    } else if (accum[accum.length - 1][0] === el && accum[accum.length - 1].length < size) {
      accum[accum.length - 1] += el
    }
    return accum
  }, []) // .join('') можно сразу сюда добавить и  просто вернуть резалт
  return result.join('')
}
