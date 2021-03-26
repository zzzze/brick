import { Action } from '../compile-action'
import { Actions } from '../parse-actions'
import bindBrickInstance from '../bind-brick-instance'
import { BrickInstance } from '@/types'

describe('parseActions', () => {
  test('parse actions string correctly', () => {
    const actions: Actions = {
      add: (($this: BrickInstance, a: number, b: number, ctx: { result: number }) =>
        (ctx.result = a + b + ($this.data.a as number))) as Action,
      sub: (($this: BrickInstance, a: number, b: number, ctx: { result: number }) =>
        (ctx.result = a - b - ($this.data.a as number))) as Action,
    }
    const instance: BrickInstance = {
      data: {
        a: 4,
      },
      actions: {},
      handlers: {},
      supply: {
        data: {},
        actions: {},
      },
      setData: () => console.log(),
      emit: () => console.log(),
      isBrickInstance: true,
    }
    bindBrickInstance(actions, instance)
    const ctx = { result: 0 }
    actions.add(2, 4, ctx)
    expect(ctx.result).toBe(10)
    actions.sub(8, 4, ctx)
    expect(ctx.result).toBe(0)
  })
})
