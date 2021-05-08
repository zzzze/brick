import { DataObject } from '../types'
import { DataConfig } from './data-type'
import { ContextType } from '../context'
import evalExpr from './eval-data-expr'
import { captureAttrDependencies, isExpression, isForParamsExpression } from '../utils/expression'

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
export default function parseData(
  engineCtx: ContextType,
  dataConfig: DataConfig,
  data: DataObject,
  pSupply: DataObject
): DataObject {
  const keys = Array.from(new Set([...Object.keys(dataConfig), ...Object.keys(data)]))
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
      if (
        isExpression(value, engineCtx.options.delimiters) &&
        !isForParamsExpression(value, engineCtx.options.delimiters, [
          engineCtx.options.identifiers.forItem,
          engineCtx.options.identifiers.forIndex,
        ])
      ) {
        const matches = captureAttrDependencies(value, `${engineCtx.options.identifiers.idPrefix}this`)
        const dependentData: DataObject = {}
        if (matches) {
          matches.forEach((attr) => {
            const valueOfAttr = getValueOfkey(result, attr, traversedKeys)
            dependentData[attr] = valueOfAttr
          })
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
