import React from 'react'
import { mount } from 'enzyme'
import { ObjectKeyValueInput } from '../'
import { ObjectInputEventData } from '../../object-input-props'

describe('ObjectKeyValueInput', () => {
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

  test('change value of object field', () => {
    const defaultValue = {
      foo: 'bar',
    }
    const handleChange = jest.fn()
    const wrapper = mount(<ObjectKeyValueInput name="object" value={defaultValue} onChange={handleChange} />)
    wrapper.find('input[name="0-value"]').simulate('change', {
      target: {
        name: '0-value',
        value: 'hello-world',
      },
    })
    expect(handleChange).toBeCalledWith({
      target: {
        name: 'object',
        value: {
          foo: 'hello-world',
        },
      },
    })
  })

  test('change key of object field', () => {
    const defaultValue = {
      foo: 'bar',
    }
    const handleChange = jest.fn()
    const wrapper = mount(<ObjectKeyValueInput name="object" value={defaultValue} onChange={handleChange} />)
    wrapper.find('input[name="0-label"]').simulate('change', {
      target: {
        name: '0-label',
        value: 'baz',
      },
    })
    expect(handleChange).toBeCalledWith({
      target: {
        name: 'object',
        value: {
          baz: 'bar',
        },
      },
    })
  })

  test('add new field', () => {
    let value: Record<string, string> = {
      foo: 'bar',
    }
    const handleChange = (data: ObjectInputEventData) => {
      value = data.target.value
    }
    const wrapper = mount(<ObjectKeyValueInput name="object" value={value} onChange={handleChange} />)
    wrapper.find('button[data-testid="add-item"]').simulate('click')
    wrapper.find('input[name="1-label"]').simulate('change', {
      target: {
        name: '1-label',
        value: 'baz',
      },
    })
    wrapper.find('input[name="1-value"]').simulate('change', {
      target: {
        name: '1-value',
        value: '123',
      },
    })
    expect(value).toEqual({
      foo: 'bar',
      baz: '123',
    })
  })

  test('remove field', () => {
    let value: Record<string, string> = {
      foo: 'bar',
      baz: '123',
    }
    const handleChange = (data: ObjectInputEventData) => {
      value = data.target.value
    }
    const wrapper = mount(<ObjectKeyValueInput name="object" value={value} onChange={handleChange} />)
    wrapper.find('button[data-testid="remove-btn-0"]').simulate('click')
    expect(value).toEqual({
      baz: '123',
    })
  })

  test('set to empty plain object if value is not plain object', () => {
    const defaultValue = new RegExp('.')
    const handleChange = jest.fn()
    mount(<ObjectKeyValueInput name="object" value={defaultValue as any} onChange={handleChange} />) // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    expect(handleChange).toBeCalledWith({
      target: {
        name: 'object',
        value: {},
      },
    })
  })
})
