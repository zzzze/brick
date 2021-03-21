import { useMemo } from 'react'
import {Actions} from './parse-actions'
import { Config, BrickContext, VALUE_PARAM_PATTERN, idPrefix } from '../types'
import { interpreteParam } from '../utils'
import parseActions from './parse-actions'

export default function useSupply(
  config: Config,
  context: BrickContext,
  data: Record<string, unknown>,
  actions: Actions
): BrickContext {
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const dataKeys = Object.keys(supplyData)
    if (dataKeys.length <= 0) {
      return supplyData
    }
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string' && VALUE_PARAM_PATTERN.test(value)) {
        value = interpreteParam(value, {
          $this: data,
          // supply: context.data,
          ...context.data,
        })
      }
      result[key] = value
      return result
    }, {})
    if (config.id) {
      supplyData = {
        [`${idPrefix}${config.id}`]: supplyData,
      }
    } else {
      supplyData = {
        $global: supplyData,
      }
    }
    return supplyData
  }, [config, context, actions, data])
  const supplyActions = useMemo(() => {
    let supplyActions = {}
    const originActions = config.supply?.actions ?? {}
    const actionKeys = Object.keys(originActions)
    if (actionKeys.length <= 0) {
      return originActions
    }
    supplyActions = parseActions(originActions, {
      $this: {
        actions,
      },
      ...context.actions,
    })
    if (config.id) {
      supplyActions = {
        [`${idPrefix}${config.id}`]: supplyActions,
      }
    } else {
      supplyActions = {
        $global: supplyActions,
      }
    }
    return supplyActions
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
