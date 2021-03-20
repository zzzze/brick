import Context from '../context'
import { useContext, useEffect, useMemo } from 'react'
import { Action, Actions, Config, SupplyInRender } from '../types'
import parseActions from './parse-actions'

export default function useActions(
  config: Config,
  pSupply: SupplyInRender,
  actions: Record<string, Action>
): Record<string, Action> {
  const context = useContext(Context)
  const listeners = useMemo<Actions>(() => {
    return parseActions(config.listeners ?? {}, {
      $this: {
        actions,
        supply: pSupply.actions,
      },
      $supply: pSupply.actions,
    })
  }, [config.actions, pSupply, actions])
  useEffect(() => {
    const _listeners = Object.keys(listeners || {}).map((key) => {
      context.ee.on(key, listeners[key])
      return () => context.ee.off(key, listeners[key])
    })
    return () => {
      _listeners.map((func) => func())
    }
  }, [listeners])
  return listeners
}
