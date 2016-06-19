/* Poor man's in-memory cache */

let cache = new Map()

export const getCached = (key) => {
  return cache.get(key)
}

export const setCached = (key, value) => {
  return cache.set(key, value)
}

export const isCached = (key) => {
  return cache.has(key)
}

export const setCachedFromObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    cache.set(key, obj[key])
  })
  return cache
}
