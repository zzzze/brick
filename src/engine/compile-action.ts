import { Action, Emit, SetData } from '@/types'

export function compileAction(fn: string, setData: SetData, emit: Emit): Action {
  return (...args: unknown[]) => {
    void setData // cheak on compiler
    void emit // cheak on compiler
    let action: (...args: unknown[]) => void = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    eval(`action = ${fn}`) // TODO: compile in build mode
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
