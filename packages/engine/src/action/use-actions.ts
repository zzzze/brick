import { useMemo } from 'react'
import { Action, Actions, Config, SupplyInRender } from '../types'
import parseActions from './parse-actions'

export default function useActions(config: Config, context: SupplyInRender): Record<string, Action> {
  return useMemo<Actions>(() => {
    return parseActions(config.actions ?? {}, {
      $this: {
        supply: context.actions,
      },
      $supply: context.actions,
    })
  }, [config.actions, context])
}
