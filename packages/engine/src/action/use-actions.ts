import { useMemo } from 'react'
import { Actions } from './parse-actions'
import { Action, BrickInstance } from '../types'
import { Blueprint, BrickContext } from '../types'
import parseActions from './parse-actions'

export default function useActions(
  instance: BrickInstance,
  config: Blueprint,
  context: BrickContext
): Record<string, Action> {
  return useMemo<Actions>(() => {
    return parseActions(instance, config.actions ?? {}, {
      $this: {
        supply: context.actions,
      },
      $supply: context.actions,
    })
  }, [config.actions, context])
}
