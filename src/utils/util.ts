import jwt from 'jsonwebtoken'

/**
 * Call it inside an async function and it will sleep
 *
 * @param ms - milliseconds
 */
export const sleep = (ms: number = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Returns the callee name
 *
 * @param depth - Pass depth to get the name of the higher level function
 */
export const getFunctionName = (depth: number = 1) => {
  const error = new Error()
  if (error.stack) {
    // tslint:disable-next-line:max-line-length
    return ((((error.stack.split('at ') || [])[1 + depth] || '').match(/(^|\.| <| )(.*[^(<])( \()/) || [])[2] || '').split('.').pop()
  }
  return 'NULL'
}

/**
 *
 * @param timestamp Unix timestamp
 * @returns YYYY-MM-DD format from a timestamp
 */
export const formatDateFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay()
  return year + '-' + month + '-' + day
}

/**
 *
 * @param isoDate isoDate
 * @returns DD/MM/YYYY format from a ISO string date
 */
export const formatDateFromIsoFormat = (isoDate: string): string => {
  return isoDate
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('/')
}

/**
 *
 * @param isoDate
 * @returns an integer that represents time from an ISO format string date
 */
export const getIntFromDate = (isoDate: string) => {
  return parseInt(
    isoDate
      .replace('T', '')
      .replace('Z', '')
      .replace('.', '')
      .replace(/:/g, '')
      .replace(/-/g, '')
    , 10)
}

export const throttle = (func: (...args: any) => any, delay: number) => {
  let inProgress = false
  return (...args: any) => {
    if (inProgress) {
      return
    }
    inProgress = true
    // Consider moving this line before the set timeout if you want the very first one to be immediate
    func(...args)
    setTimeout(() => {
      inProgress = false
    }, delay)
  }
}

/**
 *
 * @param value that need to be proved
 * @returns true | false whether is a number or not
 */
export const isNumber = (value: string | number): boolean => {
  return ((value != null) &&
    (value !== '') &&
    !isNaN(Number(value.toString())))
}

/**
  * Verifies whether the email is valid or not
  *
  * @param email
  * @returns true or false
*/
export const isEmailValid = (email: string) => {

  const validEmailRegex = /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/

  return validEmailRegex.test(email)
}

/**
 * Verifies whether a password is secure or not
 *
 * @param password
 * @returns true or false
 */
export const isPasswordSecure = (password: string): boolean => {


  const strongPasswordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')

  return strongPasswordRegex.test(password)
}

export const nowInSeconds = () => {
  return Math.floor(Date.now() / 1000)
}

import api from '../services/api'

export const isTokenValid = async (token: string | undefined): Promise<Boolean> => {

  if (!token) return false

  let decoded: any

  // decoded = jwt.verify(token, 'lI@D2zeg$e6mKY!5', {})

  await api.get('/account/decode').then(response => {
    decoded = { ...response.data };
  }).catch(err => {
    decoded = undefined
  })

  if (!decoded) return false

  const now = nowInSeconds()

  return decoded.exp >= now
}

export function getFilename(url: string) {
  if (url) {
    var m = url.toString().match(/.*\/(.+?)\./);
    if (m && m.length > 1) {
      return m[1];
    }
  }
  return "";
}


export function matchingWords(source: string, comparTo: string) {
  if (!source || source.length === 0)
    return false

  if (!comparTo || comparTo.length === 0)
    return false

  const sourceWords = source.split(' ')

  const compareToWords = comparTo.split(' ')

  const matchWords = compareToWords.map(comparingWord => {
    let match = false

    sourceWords.forEach(sourceWord => {
      if (match)
        return

      match = sourceWord.toLowerCase() === comparingWord.toLowerCase()
    })

    return match
  })

  const matchCount = matchWords.reduce((acc, value) => {
    acc += value ? 1 : 0

    return acc
  }, 0)

  console.log(`Matching? ${matchCount} | ${compareToWords.length}`)

  return matchCount === compareToWords.length;
}


/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
//export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
export function groupBy(list: Array<any>, keyGetter: any) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
