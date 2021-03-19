import { useMemo } from 'react'
import { Action, Actions, Brick, BrickInstance, Config, VALUE_PARAM_PATTERN } from './types'
import { interpreteParam } from './utils'
import { compileAction } from './compile-action'

export default function useHandlers(
  brick: Brick,
  config: Config,
  actions: Record<string, Action>,
  $this: Omit<BrickInstance, 'children' | 'handlers' | 'actions'>
): Record<string, Action> {
  return useMemo<Actions>(() => {
    return (
      brick.eventNames?.reduce<Actions>((result, name) => {
        const functionStr = config.handlers?.[name] || brick.defaultHandlers?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (typeof functionStr !== 'function' && VALUE_PARAM_PATTERN.test(functionStr)) {
          action = interpreteParam(functionStr, {
            $this: {
              ...actions,
              supply: $this.supply.actions,
            },
            $supply: $this.supply.actions,
          }) as (...args: unknown[]) => void
        } else {
          action = compileAction(functionStr, $this.setData, $this.emit)
        }
        const handler = (event: unknown) => {
          action(
            {
              ...$this,
              actions: actions,
            },
            event
          )
        }
        result[name] = handler
        return result
      }, {}) || {}
    )
  }, [brick, config, $this])
}
