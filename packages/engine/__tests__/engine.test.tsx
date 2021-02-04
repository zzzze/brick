import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'

describe('Engine', () => {
  test('toggle config form', () => {
    const config: Config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'hello',
          },
          version: '0.0.1',
        },
        {
          name: 'Text',
          data: {
            content: 'world',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    // show
    wrapper.find('button').at(0).simulate('click')
    expect(wrapper.html()).toContain('edit View')
    wrapper.find('button').at(1).simulate('click')
    expect(wrapper.html()).toContain('edit Text: hello')
    wrapper.find('button').at(2).simulate('click')
    expect(wrapper.html()).toContain('edit Text: world')

    // hide
    wrapper.find('button').at(0).simulate('click')
    expect(wrapper.html()).not.toContain('edit View')
    wrapper.find('button').at(1).simulate('click')
    expect(wrapper.html()).not.toContain('edit Text: hello')
    wrapper.find('button').at(2).simulate('click')
    expect(wrapper.html()).not.toContain('edit Text: world')
  })

  test('default data', () => {
    const config: Config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
        {
          name: 'TextWithDefaultValue',
          data: {},
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update value', () => {
    const config: Config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const ref = React.createRef<Engine>()
    const wrapper = mount(
      <>
        <Engine ref={ref} config={config} />
      </>
    )
    wrapper.find('button[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[data-testid="content-input"]').simulate('change', { target: { name: 'content', value: 'bar' } })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'bar',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    })
  })

  test('multiple brick at root', () => {
    const config: Config[] = [
      {
        name: 'Text',
        data: {
          content: 'foo',
        },
        version: '0.0.1',
      },
      {
        name: 'TextWithDefaultValue',
        data: {},
        version: '0.0.1',
      },
      {
        name: 'View',
        children: [
          {
            name: 'Text',
            data: {
              content: 'hello',
            },
            version: '0.0.1',
          },
          {
            name: 'Text',
            data: {
              content: 'world',
            },
            version: '0.0.1',
          },
        ],
        version: '0.0.1',
      },
    ]
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update id', () => {
    const config: Config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const ref = React.createRef<Engine>()
    const wrapper = mount(
      <>
        <Engine ref={ref} config={config} />
      </>
    )
    wrapper.find('button[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[name="id"]').simulate('change', {
      target: {
        name: 'id',
        value: 'baz',
      },
    })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          id: 'baz',
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    })
  })

  test('update actions', () => {
    const config: Config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const ref = React.createRef<Engine>()
    const wrapper = mount(
      <>
        <Engine ref={ref} config={config} />
      </>
    )
    wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
    wrapper.find('textarea[name="actions"]').simulate('change', {
      target: {
        name: 'actions',
        value: JSON.stringify({
          handleClick: 'function(){}',
        }),
      },
    })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
      ],
      actions: {
        handleClick: 'function(){}',
      },
      version: '0.0.1',
    })
  })
})
