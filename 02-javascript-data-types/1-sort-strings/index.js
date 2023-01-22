/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const array = [...arr]
  if (param === 'asc') {
    return array.sort((a, b) => a.localeCompare(b, 'ru', { caseFirst: 'upper' }))
  } else if (param === 'desc') {
    return array.sort((a, b) => a.localeCompare(b, 'ru', { caseFirst: 'upper' })).reverse()
  }
}
