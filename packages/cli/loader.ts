const flagMap: Record<string, string> = {}

function setFuncFlag(obj: unknown): unknown {
  if (!obj) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(function (item) {
      return setFuncFlag(item)
    })
  }
  if (typeof obj === 'object') {
    return Object.keys(obj || {}).reduce<Record<string, unknown>>(function (result, key) {
      result[key] = setFuncFlag(result[key])
      return result
    }, (obj as Record<string, unknown>) || {})
  }
  if (typeof obj === 'string' && /^\s*function\s*\(/.test(obj)) {
    const key = Math.random().toString(36).slice(2).toUpperCase()
    flagMap[key] = `function (setData, emit) {
      return ${obj}
    }`
    return key
  }
  return obj
}

export default function loader(source: string | Record<string, unknown>): string {
  // eslint-disable-next-line
  // @ts-ignore
  if (this.cacheable) this.cacheable() // eslint-disable-line
  let obj: Record<string, unknown> =
    typeof source === 'string' ? (JSON.parse(source) as Record<string, unknown>) : source
  obj = setFuncFlag(obj) as Record<string, unknown>
  let value = JSON.stringify(obj, null, 2)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  Object.keys(flagMap).forEach(function (key) {
    value = value.replace(`"${key}"`, flagMap[key])
  })
  return `module.exports = ${value}`
}
