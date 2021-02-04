import { useMemo } from 'react'
import { Action, Actions, Brick, Config, SupplyInRender, VALUE_PARAM_PATTERN } from '@/types'
import { interpreteParam } from '@/utils'
import { compileAction } from '@/compile-action'
import { HandlersUseInRender } from '@/use-handlers-use-in-render'

export default function useHandlers(
  brick: Brick,
  actions: Actions,
  config: Config,
  pSupply: SupplyInRender,
  handlers: HandlersUseInRender
): Record<string, Action> {
  return useMemo<Actions>(() => {
    return (
      brick.eventNames?.reduce<Actions>((result, name) => {
        const functionStr = config.handlers?.[name] || brick.defaultHandlers?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (typeof functionStr !== 'function' && VALUE_PARAM_PATTERN.test(functionStr)) {
          action = interpreteParam(functionStr, {
            $supply: pSupply.actions || {},
            $this: actions,
          }) as (...args: unknown[]) => void
        } else {
          action = compileAction(functionStr, handlers.setData, handlers.emit)
        }
        result[name] = action
        return result
      }, {}) || {}
    )
  }, [brick, actions, config.handlers, pSupply])
}
