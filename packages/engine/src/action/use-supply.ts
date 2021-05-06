import { useMemo } from 'react'
import { Actions } from './parse-actions'
import { Blueprint, BrickContext, VALUE_PARAM_PATTERN, idPrefix, BrickInstance } from '../types'
import parseActions from './parse-actions'
import evalExpr from '../data/eval-data-expr'

export default function useSupply(
  instance: BrickInstance,
  config: Blueprint,
  context: BrickContext,
  data: Record<string, unknown>,
  actions: Actions
): BrickContext {
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const result: Record<string, unknown> = {
      $parent: supplyData,
    }
    const dataKeys = Object.keys(supplyData)
    if (dataKeys.length <= 0) {
      return result
    }
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string' && VALUE_PARAM_PATTERN.test(value) && !/\b(item|index)\b/.test(value)) {
        value = evalExpr(value, data, context.data ?? {})
      }
      result[key] = value
      return result
    }, {})
    result.$parent = supplyData
    if (config.id) {
      result[`${idPrefix}${config.id}`] = supplyData
    }
    return result
  }, [config, context, actions, data])
  const supplyActions = useMemo(() => {
    let supplyActions = {}
    const originActions = config.supply?.actions ?? {}
    const actionKeys = Object.keys(originActions)
    const result: Record<string, unknown> = {
      $parent: originActions,
    }
    if (actionKeys.length <= 0) {
      return result
    }
    supplyActions = parseActions(instance, originActions, {
      $this: {
        actions,
      },
      ...context.actions,
    })
    result.$parent = supplyActions
    if (config.id) {
      result[`${idPrefix}${config.id}`] = supplyActions
    }
    return result
  }, [config, context, actions])
  return useMemo(() => {
    return {
      data: {
        ...context.data,
        ...supplyData,
      },
      actions: {
        ...context.actions,
        ...supplyActions,
      },
    }
  }, [supplyData, supplyActions, context])
}
