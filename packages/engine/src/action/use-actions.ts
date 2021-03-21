import { useMemo } from 'react'
import {Actions} from './parse-actions'
import {Action} from './compile-action'
import { Config, BrickContext } from '../types'
import parseActions from './parse-actions'

export default function useActions(config: Config, context: BrickContext): Record<string, Action> {
  return useMemo<Actions>(() => {
    return parseActions(config.actions ?? {}, {
      $this: {
        supply: context.actions,
      },
      $supply: context.actions,
    })
  }, [config.actions, context])
}
