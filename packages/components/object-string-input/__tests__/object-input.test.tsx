import React from 'react'
import { mount } from 'enzyme'
import { ObjectStringInput } from '../'

describe('ObjectStringInput', () => {
  let handleChange: jest.Mock
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    handleChange = jest.fn()
    consoleError = jest.spyOn(console, 'error')
  })

  afterEach(() => {
    handleChange.mockRestore()
    consoleError.mockRestore()
  })

  test('not trigger onChange when object is invalid', () => {
    consoleError.mockReturnValueOnce(null)
    const defaultValue = {
      foo: 'bar',
    }
    const wrapper = mount(<ObjectStringInput name="object" value={defaultValue} onChange={handleChange} />)
    wrapper.find('textarea').simulate('change', { target: { value: `{"foo": "baz", "bar": 123` } })
    expect(consoleError).toBeCalledTimes(1)
    expect(handleChange).not.toBeCalled()
  })

  test('trigger onChange when object is valid', () => {
    const defaultValue = {
      foo: 'bar',
    }
    const handleChange = jest.fn()
    const wrapper = mount(<ObjectStringInput name="object" value={defaultValue} onChange={handleChange} />)
    wrapper.find('textarea').simulate('change', { target: { value: `{"foo": "baz", "bar": 123}` } })
    expect(handleChange).toBeCalledWith({
      target: {
        name: 'object',
        value: {
          foo: 'baz',
          bar: 123,
        },
      },
    })
  })

  test('set to empty plain object if value is not plain object', () => {
    const defaultValue = new RegExp('.')
    const handleChange = jest.fn()
    mount(<ObjectStringInput name="object" value={defaultValue as any} onChange={handleChange} />) // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    expect(handleChange).toBeCalledWith({
      target: {
        name: 'object',
        value: {},
      },
    })
  })
})
