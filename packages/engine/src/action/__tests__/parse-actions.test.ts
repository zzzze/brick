import parseActions, { ActionObj } from '../parse-actions'
import { Action } from '../../types'

describe('parseActions', () => {
  test('parse actions string correctly', () => {
    const actionObj: ActionObj = {
      add: `(a: number, b: number, ctx: {result: number}) => (ctx.result = a + b)`,
      sub: () => ((a: number, b: number, ctx: { result: number }) => (ctx.result = a - b)) as Action,
      mul: '{{$container.mul}}',
    }
    const context = {
      $container: {
        mul: (a: number, b: number, ctx: { result: number }) => (ctx.result = a * b),
      },
    }
    const ctx = { result: 0 }
    const actions = parseActions(actionObj, context)
    actions.add(2, 4, ctx)
    expect(ctx.result).toBe(6)
    actions.sub(8, 4, ctx)
    expect(ctx.result).toBe(4)
    actions.mul(8, 4, ctx)
    expect(ctx.result).toBe(32)
  })
})
