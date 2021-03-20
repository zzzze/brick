import { useMemo } from 'react'
import { Action, Actions, Config, SupplyInRender } from '../types'
import parseActions from './parse-actions'

export default function useActions(config: Config, pSupply: SupplyInRender): Record<string, Action> {
  return useMemo<Actions>(() => {
    return parseActions(config.actions ?? {}, {
      $this: {
        supply: pSupply.actions,
      },
      $supply: pSupply.actions,
    })
  }, [config.actions, pSupply])
}
