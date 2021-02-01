import { useContext, useEffect, useMemo } from 'react'
import { Actions, Config, SupplyInRender, VALUE_PARAM_PATTERN } from '@/types'
import { interpreteParam } from '@/utils'
import { compileAction } from './compile-action'
import Context from '@/engine/context'
import { HandlersUseInRender } from './use-handlers-use-in-render'

export default function useListeners(
  actions: Actions,
  config: Config,
  pSupply: SupplyInRender,
  handlers: HandlersUseInRender
): void {
  const context = useContext(Context)
  const listeners = useMemo<Actions>(() => {
    return (
      Object.keys(config.listeners || {}).reduce<Actions>((result, name) => {
        const functionStr = config.listeners?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (VALUE_PARAM_PATTERN.test(functionStr)) {
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
  }, [config.listeners, pSupply.actions, actions])
  useEffect(() => {
    const _listeners = Object.keys(listeners || {}).map((key) => {
      context.ee.on(key, listeners[key])
      return () => context.ee.off(key, listeners[key])
    })
    return () => {
      _listeners.map((func) => func())
    }
  }, [listeners])
}
