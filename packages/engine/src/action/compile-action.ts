import { transform } from '@babel/standalone'

export interface Action {
  (...args: unknown[]): void
  binded?: boolean
  instance_key?: string
}

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
export default function compileAction(fn: Func): Action {
  return (...args: unknown[]) => {
    let action: Action = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    if (checkFnIsAction(fn)) {
      action = fn()
    } else {
      fn = `action = ${fn}`
      fn =
        transform(fn, {
          filename: 'action.ts',
          presets: ['env', 'typescript'],
        }).code || ''
      eval(fn)
    }
    return action(...args)
  }
}
