import { useMemo } from 'react'
import { Action, Actions, BrickInstance, Config, SupplyInRender, VALUE_PARAM_PATTERN } from './types'
import { interpreteParam } from './utils'
import { compileAction } from './compile-action'

export default function useActions(
  config: Config,
  pSupply: SupplyInRender,
  $this: Omit<BrickInstance, 'children' | 'handlers' | 'actions'>
): Record<string, Action> {
  return useMemo<Actions>(() => {
    return Object.keys(config.actions || {}).reduce<Actions>((result, key) => {
      const functionStr = config.actions?.[key] || 'function(){}'
      let action: (...args: unknown[]) => void
      if (typeof functionStr !== 'function' && VALUE_PARAM_PATTERN.test(functionStr)) {
        action = interpreteParam(functionStr, {
          $this: {
            supply: $this.supply.actions || {},
          },
        }) as (...args: unknown[]) => void
      } else {
        action = compileAction(functionStr, $this.setData, $this.emit)
      }
      const handler = (...args: unknown[]) => {
        const firstArgs = args[0]
        if (firstArgs && typeof firstArgs === 'object') {
          if (['data', 'emit', 'setData'].every((key) => Object.keys(firstArgs).includes(key))) {
            args = args.slice(1)
          }
        }
        action({ ...$this, actions: result }, ...args)
      }
      result[key] = handler
      return result
    }, {})
  }, [config.actions, pSupply])
}
