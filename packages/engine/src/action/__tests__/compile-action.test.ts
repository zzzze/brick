import compileAction from '../compile-action'
import { Action } from '../../types'

describe('compileAction', () => {
  test('compile function string correctly', () => {
    const ctx = { result: 0 }
    const func = `function (a: number, b: number): void {
      this.result = a + b + this.result
    }`
    compileAction(ctx, func)(2, 5)
    expect(ctx.result).toBe(7)
  })

  test('should not use arrow function 01', () => {
    const ctx = { result: 0 }
    const func = `(a: number, b: number): void => {
      this.result = a + b + this.result
    }`
    expect(() => compileAction(ctx, func)(2, 5)).toThrow()
  })

  test('compile function correctly', () => {
    const ctx = { result: 0 }
    const func = function () {
      return function (this: typeof ctx, a: number, b: number): void {
        this.result = a + b + this.result
      }
    }
    compileAction(ctx, func as () => Action)(2, 5)
    expect(ctx.result).toBe(7)
  })

  test('should not use arrow function 02', () => {
    const ctx = { result: 0 }
    const func = () => (a: number, b: number): void => {
      ;((this as unknown) as typeof ctx).result = a + b + ((this as unknown) as typeof ctx).result
    }
    expect(() => compileAction(ctx, func as () => Action)(2, 5)).toThrow()
  })
})
