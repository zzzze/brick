import { DataObject, VALUE_PARAM_PATTERN } from '../types'
import { DataConfig } from './data-type'
import evalExpr from './eval-data-expr'

/**
 * Parse data of brick instance
 * @param {DataConfig} dataConfig data config from brick definition
 * @param {DataObject} data data of brick instance
 * @param {DataObject} supply data from parent brick
 * @returns {DataObject}
 * @example
 *    dataConfig:
 *    {
 *      name: {
 *         type: 'string',
 *         default: 'foo',
 *      },
 *      age: {
 *         type: 'number',
 *         default: 1,
 *      },
 *    }
 *
 *    pSupply:
 *    {
 *        $container: {
 *            age: 10,
 *        },
 *    }
 *
 *    data:
 *    {
 *        name: 'bar',
 *        nickname: '{{$this.name}}',
 *        age: '{{$container.age}}',
 *    }
 *
 *    =====>
 *
 *    {
 *        name: 'bar',
 *        nickname: 'bar',
 *        age: 10,
 *    }
 */
export default function parseData(dataConfig: DataConfig, data: DataObject, pSupply: DataObject): DataObject {
  const keys = Object.keys(dataConfig)
  const newData = keys.reduce<DataObject>((result, key) => {
    if (typeof result[key] !== 'undefined') {
      return result
    }
    const getValueOfkey = (result: DataObject, key: string, traversedKeys: string[]) => {
      if (traversedKeys.includes(key)) {
        throw Error('circular dependence')
      }
      traversedKeys = traversedKeys.concat(key)
      let value = data[key] ?? dataConfig[key].default
      if (typeof value === 'string' && VALUE_PARAM_PATTERN.test(value) && !/\b(item|index)\b/.test(value)) {
        const match = /^\{\{\s*\$this\.(\w+)\.?/.exec(value)
        const dependentData: DataObject = {}
        if (match) {
          const attr = match[1]
          const valueOfAttr = getValueOfkey(result, attr, traversedKeys)
          dependentData[attr] = valueOfAttr
        }
        value = evalExpr(value, { ...dependentData }, pSupply)
      }
      // TODO: validate value
      result[key] = value
      return value
    }
    const value = getValueOfkey(result, key, [])
    result[key] = value
    return result
  }, {})
  return newData
}
