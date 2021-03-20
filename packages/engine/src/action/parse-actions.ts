import { VALUE_PARAM_PATTERN } from '../types'
import { interpreteParam } from '../utils'
import compileAction, { Action, Func } from './compile-action'

export type Actions = Record<string, Action>
export type ActionObj = Record<string, Func>

/**
 * parse ActionObj to Actions
 * @param {ActionObj} obj action sets which children can be parametric expressions, function string or function.
 * @param {Record<string, unknown>} context provide data for parametric expressions.
 * @returns {Actions}
 * @example
 *  {
 *    a: "{{$container.onClick}}", // parametric expressions
 *    b: "() => {}",               // function string
 *    c: () => {},                 // function
 *  }
 *  will be parsed to
 *  {
 *    a: () => {},
 *    b: () => {},
 *    c: () => {},
 *  }
 */
export default function parseActions(obj: ActionObj, context: Record<string, unknown>): Actions {
  return Object.keys(obj || {}).reduce<Actions>((result, key) => {
    const func = obj[key] || 'function(){}'
    let action: Action
    if (typeof func === 'string' && VALUE_PARAM_PATTERN.test(func)) {
      action = interpreteParam(func, context) as Action
    } else {
      action = compileAction(func)
    }
    result[key] = action
    return result
  }, {})
}
