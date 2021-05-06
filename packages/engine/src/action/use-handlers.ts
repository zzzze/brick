import { useMemo } from 'react'
import { Actions } from './parse-actions'
import { Action, BrickInstance } from '../types'
import { Brick, Blueprint, BrickContext } from '../types'
import { Func } from './compile-action'
import parseActions from './parse-actions'

export default function useHandlers(
  instance: BrickInstance,
  brick: Brick,
  config: Blueprint,
  context: BrickContext,
  actions: Record<string, Action>
): Record<string, Action> {
  return useMemo<Actions>(() => {
    const obj = brick.eventNames?.reduce<Record<string, Func>>((result, key) => {
      const handler = config.handlers?.[key] || brick.defaultHandlers?.[key]
      if (handler) {
        result[key] = handler
      }
      return result
    }, {})
    return parseActions(instance, obj as Record<string, Func>, {
      $this: {
        actions,
        supply: context.actions,
      },
      $supply: context.actions,
      ...context.actions,
    })
  }, [brick, actions, config.handlers, context])
}
