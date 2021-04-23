import { pattern } from '@brick/shared'
const flagMap: Record<string, string> = {}

function setFuncFlag(value: unknown, label = 'brickroot', path = ''): unknown {
  if (!value) {
    return value
  }
  if (label === 'children' && Array.isArray(value)) {
    return value.map(function (item) {
      return setFuncFlag(item)
    })
  }
  if (typeof value === 'object') {
    return Object.keys(value || {}).reduce<Record<string, unknown>>(function (result, key) {
      result[key] = setFuncFlag(result[key], key, path ? `${path}-${label}` : label)
      return result
    }, (value as Record<string, unknown>) || {})
  }
  if (path === 'brickroot' && label === 'render' && typeof value === 'string') {
    const key = Math.random().toString(36).slice(2).toUpperCase()
    flagMap[key] = `function (components) {
      return ${value}
    }`
    return key
  }
  if (
    ['brickroot-supply-actions', 'brickroot-actions', 'brickroot-handlers', 'brickroot-listeners'].includes(path) &&
    typeof value === 'string' &&
    pattern.FUNCTION_STR.test(value)
  ) {
    const key = Math.random().toString(36).slice(2).toUpperCase()
    flagMap[key] = `function (setData, emit) {
      return ${value}
    }`
    return key
  }
  return value
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
