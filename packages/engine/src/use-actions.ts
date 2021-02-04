import { useMemo } from 'react'
import { Action, Actions, Config, SupplyInRender, VALUE_PARAM_PATTERN } from '@/types'
import { interpreteParam } from '@/utils'
import { compileAction } from '@/compile-action'
import { HandlersUseInRender } from '@/use-handlers-use-in-render'

export default function useActions(
  config: Config,
  pSupply: SupplyInRender,
  handlers: HandlersUseInRender
): Record<string, Action> {
  return useMemo<Actions>(() => {
    return Object.keys(config.actions || {}).reduce<Actions>((result, key) => {
      const functionStr = config.actions?.[key] || 'function(){}'
      let action: (...args: unknown[]) => void
      if (typeof functionStr !== 'function' && VALUE_PARAM_PATTERN.test(functionStr)) {
        action = interpreteParam(functionStr, {
          $supply: pSupply.actions || {},
        }) as (...args: unknown[]) => void
      } else {
        action = compileAction(functionStr, handlers.setData, handlers.emit)
      }
      result[key] = action
      return result
    }, {})
  }, [config.actions, pSupply])
}
