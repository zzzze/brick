import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'

React.useLayoutEffect = React.useEffect

describe('Engine', () => {
  test('toggle config form', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      version: '0.0.1',
    }
    const wrapper = mount(<Engine autoCommit config={config} />)
    // show
    wrapper.find('span[data-testid="edit-btn"]').at(0).simulate('click')
    expect(wrapper.html()).toContain('edit View')

    // hide
    wrapper.find('button[data-testid="close-btn"]').at(0).simulate('click')
    expect(wrapper.html()).not.toContain('edit View')
  })

  test('default data', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
        {
          name: 'TextWithDefaultValue',
          _key: '003',
          data: {},
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine autoCommit config={config} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update value', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
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
        <Engine ref={ref} autoCommit config={config} />
      </>
    )
    wrapper.find('span[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[data-testid="content-input"]').simulate('change', { target: { name: 'content', value: 'bar' } })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
          data: {
            content: 'bar',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    })
  })

  test('update id', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
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
        <Engine ref={ref} autoCommit config={config} />
      </>
    )
    wrapper.find('span[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[name="id"]').simulate('change', {
      target: {
        name: 'id',
        value: 'baz',
      },
    })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
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
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
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
        <Engine ref={ref} autoCommit config={config} />
      </>
    )
    wrapper.find('span[data-testid="edit-btn"]').at(0).simulate('click')
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
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
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
