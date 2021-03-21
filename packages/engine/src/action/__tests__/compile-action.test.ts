import compileAction, { Action } from '../compile-action'

describe('compileAction', () => {
  test('compile function string correctly', () => {
    const func = `(a: number, b: number, context: {result: number}): void => {
      context.result = a + b
    }`
    const ctx = { result: 0 }
    compileAction(func)(2, 5, ctx)
    expect(ctx.result).toBe(7)
  })

  test('compile function correctly', () => {
    const func = () => (a: number, b: number, context: { result: number }): void => {
      context.result = a + b
    }
    const ctx = { result: 0 }
    compileAction(func as () => Action)(2, 5, ctx)
    expect(ctx.result).toBe(7)
  })
})
