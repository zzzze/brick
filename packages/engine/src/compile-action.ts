import { Action, Emit, Func, SetData } from '@/types'
import { transform } from '@babel/standalone'

export function compileAction(fn: Func, setData: SetData, emit: Emit): Action {
  return (...args: unknown[]) => {
    void setData // cheak on compiler
    void emit // cheak on compiler
    let action: (...args: unknown[]) => void = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    if (typeof fn === 'function') {
      action = fn(setData, emit)
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

export function compileActions(
  actions: Record<string, unknown>,
  setData: SetData,
  emit: Emit
): Record<string, unknown> {
  return Object.keys(actions).reduce<Record<string, unknown>>((result, key) => {
    const value = actions[key]
    if (typeof value === 'string' && !value.startsWith('{{')) {
      result[key] = compileAction(value, setData, emit)
    } else {
      result[key] = value
    }
    return result
  }, {})
}
