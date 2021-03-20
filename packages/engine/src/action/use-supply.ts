import { useMemo } from 'react'
import { Actions, Config, SupplyInRender, VALUE_PARAM_PATTERN, idPrefix } from '../types'
import { interpreteParam } from '../utils'
import parseActions from './parse-actions'

export default function useSupply(
  config: Config,
  pSupply: SupplyInRender,
  data: Record<string, unknown>,
  actions: Actions
): SupplyInRender {
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const dataKeys = Object.keys(supplyData)
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string' && VALUE_PARAM_PATTERN.test(value)) {
        value = interpreteParam(value, {
          $this: {
            ...data,
            supply: pSupply.data,
          },
        })
      }
      result[key] = value
      return result
    }, {})
    if (config.id && dataKeys.length > 0) {
      supplyData = {
        [`${idPrefix}${config.id}`]: supplyData,
      }
    }
    return supplyData
  }, [config.supply?.data, config.id, pSupply, data])
  const supplyActions = useMemo(() => {
    let supplyActions = {}
    const originActions = config.supply?.actions ?? {}
    const actionKeys = Object.keys(originActions)
    supplyActions = parseActions(originActions, {
      $this: {
        actions,
        supply: pSupply.actions,
      },
      $supply: pSupply.actions,
    })
    if (config.id && actionKeys.length > 0) {
      supplyActions = {
        [`${idPrefix}${config.id}`]: supplyActions,
      }
    }
    return supplyActions
  }, [config.supply?.actions, config.id, pSupply, actions])
  return useMemo(() => {
    return {
      data: {
        ...pSupply.data,
        ...supplyData,
      },
      actions: {
        ...pSupply.actions,
        ...supplyActions,
      },
    }
  }, [supplyData, supplyActions, pSupply])
}
