import { BrickInstance } from '@/types'
import { Actions } from './parse-actions'

/**
 * Bind brick instance to action. Make sure first argument of action is brick instance.
 * @param {Actions} actions action sets to be binded
 * @param {BrickInstance} instance brick instance
 */
export default function bindBrickInstance(actions: Actions, instance: BrickInstance): void {
  Object.keys(actions).forEach((key) => {
    const originAction = actions[key]
    actions[key] = (...args: unknown[]) => {
      const firstArgs = args[0]
      if (firstArgs && typeof firstArgs === 'object' && (firstArgs as BrickInstance).isBrickInstance) {
        args = args.slice(1)
      }
      originAction(instance, ...args)
    }
  })
}
