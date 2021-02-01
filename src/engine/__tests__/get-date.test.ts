import getData from '@/engine/get-config-data'

describe('getData', () => {
  test('get data from supply', () => {
    const data = {
      foo: '{{$supply.foo}}',
      bar: '20',
      baz: '{{$supply.$node.text}}',
    }
    const pSupply = {
      foo: '123456',
      $node: {
        text: 'abcdef',
      },
    }
    const newData = getData(['foo', 'bar', 'baz'], data, pSupply, {})
    expect(newData).toEqual({
      foo: '123456',
      bar: '20',
      baz: 'abcdef',
    })
  })

  test('get data from defaultData', () => {
    const data = {
      bar: '20',
      baz: '{{$supply.$node.text}}',
    }
    const pSupply = {
      $node: {
        text: 'abcdef',
      },
    }
    const defaultData = {
      foo: '54321',
    }
    const newData = getData(['foo', 'bar', 'baz'], data, pSupply, defaultData)
    expect(newData).toEqual({
      foo: '54321',
      bar: '20',
      baz: 'abcdef',
    })
  })

  test('get value form other field of data', () => {
    const data = {
      bar: '20',
      baz: '{{$this.bar}}',
      foo: '{{$this.baz}}',
    }
    const pSupply = {}
    const defaultData = {}
    const newData = getData(['foo', 'bar', 'baz'], data, pSupply, defaultData)
    expect(newData).toEqual({
      bar: '20',
      baz: '20',
      foo: '20',
    })
  })

  test('circular dependence - 1', () => {
    const data = {
      bar: '{{$this.bar}}',
    }
    const pSupply = {}
    const defaultData = {}
    expect(() => {
      getData(['foo', 'bar', 'baz'], data, pSupply, defaultData)
    }).toThrowError(new Error('circular dependence'))
  })

  test('circular dependence - 1', () => {
    const data = {
      bar: '{{$this.baz}}',
      baz: '{{$this.bar}}',
    }
    const pSupply = {}
    const defaultData = {}
    expect(() => {
      getData(['foo', 'bar', 'baz'], data, pSupply, defaultData)
    }).toThrowError(new Error('circular dependence'))
  })

  test('get circular dependence data - 2', () => {
    const data = {
      bar: '{{$this.foo}}',
      baz: '{{$this.bar}}',
      foo: '{{$this.baz}}',
    }
    const pSupply = {}
    const defaultData = {}
    expect(() => {
      getData(['foo', 'bar', 'baz'], data, pSupply, defaultData)
    }).toThrowError(new Error('circular dependence'))
  })
})
