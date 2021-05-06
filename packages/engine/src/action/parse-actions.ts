import { VALUE_PARAM_PATTERN } from '../types'
import { interpreteParam } from '../utils'
import compileAction, { Func } from './compile-action'
import { Action, BrickInstance } from '../types/brick-instance'

export type Actions = Record<string, Action>
export type ActionObj = Record<string, Func>

/**
 * parse ActionObj to Actions
 * @param {ActionObj} obj action sets which children can be parametric expressions, function string or function.
 * @param {Record<string, unknown>} context provide data for parametric expressions.
 * @returns {Actions}
 * @example
 *  {
 *    a: "{{$container.onClick}}",        // parametric expressions
 *    b: "(a, b) => a + b",               // function string
 *    c: c => add(a, b) => a + b + c,     // function
 *  }
 *  will be parsed to
 *  {
 *    a: (a, b) => a + b,
 *    b: (a, b) => a + b,
 *    c: (a, b) => a + b + c,
 *  }
 */
export default function parseActions(
  instance: BrickInstance,
  obj: ActionObj,
  context: Record<string, unknown>
): Actions {
  return Object.keys(obj || {}).reduce<Actions>((result, key) => {
    const func = obj[key] || 'function(){}'
    let action: Action
    if (typeof func === 'string' && VALUE_PARAM_PATTERN.test(func)) {
      action = interpreteParam(func, context, (expressions: string) => {
        if (expressions.startsWith('$this.') && !expressions.startsWith('$this.actions.')) {
          return expressions.replace('$this.', '$this.actions.')
        }
        return expressions
      }) as Action
    } else {
      action = compileAction((instance as unknown) as Record<string, unknown>, func)
    }
    result[key] = action
    return result
  }, {})
}
