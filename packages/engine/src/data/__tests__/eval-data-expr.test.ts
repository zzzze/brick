import evalExpr from '../eval-data-expr'

describe('evalExpr', () => {
  test('should success', () => {
    expect(evalExpr('{{$this.foo}}', { foo: 'hello' }, {})).toBe('hello')
    expect(evalExpr('{{$this.foo + " world"}}', { foo: 'hello' }, {})).toBe('hello world')
    expect(evalExpr('{{"world " + $this.foo}}', { foo: 'hello' }, {})).toBe('world hello')
    expect(evalExpr('{{$this.foo + 7}}', { foo: 3 }, {})).toBe(10)
    expect(evalExpr('{{$this.foo}}', { foo: false }, {})).toBeFalsy()
    expect(evalExpr('{{!$this.foo}}', { foo: false }, {})).toBeTruthy()
    expect(evalExpr('{{$other.bar}}', {}, { $other: { bar: 'world' } })).toBe('world')
    expect(evalExpr('{{"hello " + $other.bar}}', {}, { $other: { bar: 'world' } })).toBe('hello world')
    expect(evalExpr('{{$other.bar + 7}}', {}, { $other: { bar: 3 } })).toBe(10)
    expect(evalExpr('{{$other.bar}}', {}, { $other: { bar: false } })).toBeFalsy()
    expect(evalExpr('{{!$other.bar}}', {}, { $other: { bar: false } })).toBeTruthy()
  })
})
