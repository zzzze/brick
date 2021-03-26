import { BrickInstance } from '@/types'
import { Actions } from './parse-actions'

/**
 * Bind brick instance to action. Make sure first argument of action is brick instance.
 * @param {Actions} actions action sets to be binded
 * @param {BrickInstance} instance brick instance
 */
export default function bindBrickInstance(
  actions: Actions,
  instance: Omit<BrickInstance, 'children' | 'handlers'>
): void {
  Object.keys(actions).forEach((key) => {
    const originAction = actions[key]
    if (key.startsWith('$') || typeof originAction !== 'function') {
      return
    }
    const func = (...args: unknown[]) => {
      if (originAction.binded) {
        originAction(...args)
      } else {
        originAction(instance, ...args)
      }
    }
    func.binded = true
    func.instance_key = instance.key
    actions[key] = func
  })
}
