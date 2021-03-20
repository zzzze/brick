import EnginxContext from '../context'
import { useContext, useEffect, useMemo } from 'react'
import { Action, Actions, Config, SupplyInRender } from '../types'
import parseActions from './parse-actions'

export default function useActions(
  config: Config,
  context: SupplyInRender,
  actions: Record<string, Action>
): Record<string, Action> {
  const engineCtx = useContext(EnginxContext)
  const listeners = useMemo<Actions>(() => {
    return parseActions(config.listeners ?? {}, {
      $this: {
        actions,
        supply: context.actions,
      },
      $supply: context.actions,
    })
  }, [config.actions, context, actions])
  useEffect(() => {
    const _listeners = Object.keys(listeners || {}).map((key) => {
      engineCtx.ee.on(key, listeners[key])
      return () => engineCtx.ee.off(key, listeners[key])
    })
    return () => {
      _listeners.map((func) => func())
    }
  }, [listeners])
  return listeners
}