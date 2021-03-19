import { useMemo } from 'react'
import { Actions, Config, SupplyInRender, VALUE_PARAM_PATTERN, idPrefix } from './types'
import { interpreteParam } from './utils'
import { compileAction } from './compile-action'
import { InstanceHandlers } from './use-instance-handlers'

export default function useSupply(
  config: Config,
  pSupply: SupplyInRender,
  data: Record<string, unknown>,
  actions: Actions,
  handlers: InstanceHandlers
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
    const rawActions = config.supply?.actions || {}
    const actionKeys = Object.keys(rawActions)
    supplyActions = actionKeys.reduce<Actions>((result, key) => {
      const value = rawActions[key]
      let action: (...args: unknown[]) => void
      if (typeof value !== 'function' && VALUE_PARAM_PATTERN.test(value)) {
        action = interpreteParam(value, {
          $this: {
            ...actions,
            supply: pSupply.actions,
          },
          $supply: pSupply.actions,
        }) as (...args: unknown[]) => void
      } else {
        action = compileAction(value, handlers.setData, handlers.emit)
      }
      const handler = (...args: unknown[]) => {
        const firstArgs = args[0]
        if (firstArgs && typeof firstArgs === 'object') {
          if (['data', 'emit', 'setData'].every((key) => Object.keys(firstArgs).includes(key))) {
            args = args.slice(1)
          }
        }
        action({ supply: pSupply, actions, data, ...handlers }, ...args)
      }
      result[key] = handler
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
