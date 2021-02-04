import { useMemo } from 'react'
import { Action, Actions, Config, SetData, SupplyInRender, VALUE_PARAM_PATTERN, idPrefix } from './types'
import { interpreteParam } from './utils'
import { compileActions } from './compile-action'
import { HandlersUseInRender } from './use-handlers-use-in-render'

export default function useSupply(
  config: Config,
  pSupply: SupplyInRender,
  data: Record<string, unknown>,
  actions: Actions,
  handlers: HandlersUseInRender
): SupplyInRender {
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const dataKeys = Object.keys(supplyData)
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string') {
        value = interpreteParam(value, {
          $supply: pSupply.data,
          $this: data,
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
    let supplyActions = {
      ...compileActions(config.supply?.actions || {}, handlers.setData, handlers.emit),
    }
    const actionKeys = Object.keys(supplyActions)
    supplyActions = actionKeys.reduce<Actions>((result, key) => {
      let value = supplyActions[key]
      if (typeof value === 'string') {
        if (VALUE_PARAM_PATTERN.test(value)) {
          value = interpreteParam(value, {
            $supply: pSupply.actions,
            $this: actions,
          }) as (fn: SetData) => void
        }
      }
      result[key] = value as Action
      return result
    }, {})
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
