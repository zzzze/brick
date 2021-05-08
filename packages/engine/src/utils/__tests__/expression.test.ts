import {
  captureExpression,
  trimExpression,
  isExpression,
  captureAttrDependencies,
  isForParamsExpression,
} from '../expression'

describe('captureExpression', () => {
  interface Data {
    input: string
    output: string[] | null
  }
  const data: Data[] = [
    {
      input: '{{abc}}',
      output: ['{{abc}}'],
    },
    {
      input: '{{  abc }}',
      output: ['{{  abc }}'],
    },
    {
      input: '{{abc}}def{{ghi}}',
      output: ['{{abc}}', '{{ghi}}'],
    },
    {
      input: '{{  abc }}def{{ghi.foo}}',
      output: ['{{  abc }}', '{{ghi.foo}}'],
    },
    {
      input: '{{  abc }}def{{ghi.foo}}}}',
      output: ['{{  abc }}', '{{ghi.foo}}'],
    },
    {
      input: '{{  abc }}}}def{{ghi.foo}}',
      output: ['{{  abc }}', '{{ghi.foo}}'],
    },
    {
      input: '{{{{  abc }}def{{ghi.foo}}',
      output: ['{{  abc }}', '{{ghi.foo}}'],
    },
    {
      input: '{{  abc }}def{{{{ghi.foo}}',
      output: ['{{  abc }}', '{{ghi.foo}}'],
    },
  ]
  const delimiters: [string, string] = ['{{', '}}']
  data.forEach((item) => {
    test(`isExpression-${item.input}`, () => {
      expect(captureExpression(item.input, delimiters)).toEqual(item.output)
    })
  })
})

describe('trimExpression', () => {
  interface Data {
    input: string
    output: string
  }
  const data: Data[] = [
    {
      input: '{{abc}}',
      output: 'abc',
    },
    {
      input: '{{ghi}}',
      output: 'ghi',
    },
    {
      input: '{{  ghi }}',
      output: 'ghi',
    },
  ]
  const delimiters: [string, string] = ['{{', '}}']
  data.forEach((item) => {
    test(`isExpression-${item.input}`, () => {
      expect(trimExpression(item.input, delimiters)).toEqual(item.output)
    })
  })
})

describe('isExpression', () => {
  describe('should be truthy', () => {
    const expressions = [
      '{{foo}}',
      '{{ foo}}',
      '{{foo.bar}}',
      '{{foo.bar }}',
      '{{   foo.bar }}',
      '{{   foo.bar + 100 }}',
    ]
    const delimiters: [string, string] = ['{{', '}}']
    expressions.forEach((expression) => {
      test(`isExpression-${expression}`, () => {
        expect(isExpression(expression, delimiters)).toBeTruthy()
      })
    })
  })

  describe('should be falsy', () => {
    const expressions = ['{{foo}}}', '{{foo}}}}', '{{{foo}}', '{{{{foo}}', '{{{{bar}}foo}}']
    const delimiters: [string, string] = ['{{', '}}']
    expressions.forEach((expression) => {
      test(`isExpression-${expression}`, () => {
        expect(isExpression(expression, delimiters)).toBeFalsy()
      })
    })
  })
})

describe('captureAttrDependencies', () => {
  interface Data {
    input: string
    output: string[] | null
  }
  const data: Data[] = [
    {
      input: '{{$this.abc}}',
      output: ['abc'],
    },
    {
      input: '{{$this.abc+$this.def}}',
      output: ['abc', 'def'],
    },
    {
      input: '{{$this.abc+$this.def+$this.ghi.foo}}',
      output: ['abc', 'def', 'ghi'],
    },
  ]
  data.forEach((item) => {
    test(`isExpression-${item.input}`, () => {
      expect(captureAttrDependencies(item.input, '$this')).toEqual(item.output)
    })
  })
})

describe('isForParamsExpression', () => {
  describe('should be truthy', () => {
    const expressions = ['{{item}}', '{{index}}', '{{  item }}', '{{  index }}']
    const delimiters: [string, string] = ['{{', '}}']
    const forParams = ['item', 'index']
    expressions.forEach((expression) => {
      test(`isForParamsExpression-${expression}`, () => {
        expect(isForParamsExpression(expression, delimiters, forParams)).toBeTruthy()
      })
    })
  })
})
