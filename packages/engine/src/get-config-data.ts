import { DataObject, VALUE_PARAM_PATTERN } from './types'
import { interpreteParam } from './utils'

export default function getConfigData(
  keys: string[],
  data: DataObject,
  pSupply: Record<string, unknown>,
  defaultData: DataObject
): Record<string, unknown> {
  const newData = keys.reduce<Record<string, unknown>>((result, key) => {
    if (typeof result[key] !== 'undefined') {
      return result
    }
    const getValueOfkey = (result: Record<string, unknown>, key: string, traversedKeys: string[]) => {
      if (traversedKeys.includes(key)) {
        throw Error('circular dependence')
      }
      traversedKeys = traversedKeys.concat(key)
      let value = data[key] || defaultData[key]
      if (typeof value === 'string' && VALUE_PARAM_PATTERN.test(value)) {
        const match = /^\{\{\s*\$this\.(\w+)\.?/.exec(value)
        const dependentData: Record<string, unknown> = {}
        if (match) {
          const attr = match[1]
          const valueOfAttr = getValueOfkey(result, attr, traversedKeys)
          dependentData[attr] = valueOfAttr
        }
        value = interpreteParam(value, {
          $this: {
            ...dependentData,
          },
          $supply: pSupply,
        })
      }
      result[key] = value
      return value
    }
    const value = getValueOfkey(result, key, [])
    result[key] = value
    return result
  }, {})
  return newData
}
