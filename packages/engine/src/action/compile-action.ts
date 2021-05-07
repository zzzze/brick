import { transform } from '@babel/standalone'
import { Action } from '../types/brick-instance'

export type Func = string | (() => Action)

function checkFnIsAction(fn: string | Action): fn is () => Action {
  return typeof fn === 'function'
}

/**
 * ensure fn to be type of Action
 * @param {Func} fn can be function string or function
 * @returns {Action}
 * @example
 *    string, "'(a, b) => a + b'", will be compile to function, "(a, b) => a + b".
 *    function, "c => (a, b) => a + b + c", will be compile to function, "(a, b) => a + b + c".
 */
export default function compileAction(instance: Record<string, unknown>, fn: Func): Action {
  let fnStr = ''
  const action = function (this: typeof instance, ...args: unknown[]) {
    let _action: Action = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    if (checkFnIsAction(fn)) {
      _action = fn()
    } else {
      fnStr = fn
      fn = `_action = ${fn}`
      fn =
        transform(fn, {
          filename: 'action.ts',
          presets: ['env', 'typescript'],
        }).code || ''
      eval(fn)
    }
    _action = _action.bind(this)
    return _action(...args)
  }
  if (fnStr) {
    action.__source = fnStr
  }
  return action.bind(instance)
}
