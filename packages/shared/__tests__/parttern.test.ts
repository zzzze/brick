import { FUNCTION_STR } from '../pattern'

describe('FUNCTION_STR - should be truthy', () => {
  const data = [
    `function() {
      console.log('hello world')
    }`,
    `() => {
      console.log('hello world')
    }`,
    `(args) => {
      console.log('hello world')
    }`,
    `function log() {
      console.log('hello world')
    }`,
    `function log () {
      console.log('hello world')
    }`,
  ]
  data.forEach((item, i) => {
    test(`FUNCTION_STR - should be truthy - ${i}`, () => {
      expect(FUNCTION_STR.test(item)).toBeTruthy()
    })
  })
})

describe('FUNCTION_STR - should be falsy', () => {
  const data = [
    `;function log() {
      console.log('hello world')
    }`,
  ]
  data.forEach((item, i) => {
    test(`FUNCTION_STR - should be falsy - ${i}`, () => {
      expect(FUNCTION_STR.test(item)).toBeFalsy()
    })
  })
})
