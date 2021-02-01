import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import { Config } from '@/types'
import './register-bricks'

describe('supply data', () => {
  test('update supply', () => {
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
    wrapper.find('textarea[name="supply.data"]').simulate('change', {
      target: {
        name: 'supply',
        value: JSON.stringify({
          baz: '123',
          bar: '456',
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
      supply: {
        data: {
          baz: '123',
          bar: '456',
        },
      },
      version: '0.0.1',
    })
  })

  test('use and update supply', () => {
    const config: Config = {
      name: 'View',
      supply: {
        data: {
          text: 'foo',
        },
      },
      children: [
        {
          name: 'View',
          children: [
            {
              name: 'Text',
              data: {
                content: '{{$supply.text}}',
              },
              version: '0.0.1',
            },
          ],
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
    expect(wrapper.html()).toContain('foo')
    wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
    wrapper.find('textarea[name="supply.data"]').simulate('change', {
      target: {
        name: 'supply',
        value: JSON.stringify({
          text: 123,
        }),
      },
    })
    wrapper.find('button[data-testid="close-btn"]').at(0).simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123')
  })

  test('inject supply from data', () => {
    const config: Config = {
      name: 'View',
      data: {
        name: 'baz',
      },
      supply: {
        data: {
          text: '{{$this.name}}',
        },
      },
      children: [
        {
          name: 'View',
          children: [
            {
              name: 'Text',
              data: {
                content: '{{$supply.text}}',
              },
              version: '0.0.1',
            },
          ],
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
    expect(wrapper.html()).toContain('baz')
    wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
    wrapper.find('input[data-testid="name-input"]').simulate('change', {
      target: {
        name: 'name',
        value: 'bar',
      },
    })
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('bar')
  })

  test('inject supply from data and use id as namespace', () => {
    const config: Config = {
      name: 'View',
      id: 'container',
      data: {
        name: 'baz',
      },
      supply: {
        data: {
          text: '{{$this.name}}',
        },
      },
      children: [
        {
          name: 'View',
          children: [
            {
              name: 'Text',
              data: {
                content: '{{$supply.$container.text}}',
              },
              version: '0.0.1',
            },
          ],
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
    expect(wrapper.html()).toContain('baz')
    wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
    wrapper.find('input[data-testid="name-input"]').simulate('change', {
      target: {
        name: 'name',
        value: 'bar',
      },
    })
    wrapper.find('button[data-testid="close-btn"]').at(0).simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('bar')
  })
})
