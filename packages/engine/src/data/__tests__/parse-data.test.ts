import { ContextType } from '../../context'
import { DataConfig } from '../data-type'
import parseData from '../parse-data'

describe('parseData', () => {
  test('', () => {
    const dataConfig = {
      name: {
        type: 'string',
        default: 'foo',
      },
      age: {
        type: 'number',
        default: 1,
      },
    }
    const pSupply = {
      $container: {
        age: 10,
      },
    }
    const data = {
      name: 'bar',
      title: 'abc',
      desc: '{{item}}',
      nickname: '{{$this.name + $this.title}}',
      age: '{{$container.age + 10}}',
    }
    const context: ContextType = {
      options: {
        delimiters: ['{{', '}}'],
        identifiers: {
          forItem: 'item',
          forIndex: 'index',
          idPrefix: '$',
        },
      },
    } as ContextType
    const newData = parseData(context, (dataConfig as unknown) as DataConfig, data, pSupply)
    expect(newData).toEqual({
      name: 'bar',
      title: 'abc',
      nickname: 'barabc',
      desc: '{{item}}',
      age: 20,
    })
  })
})
