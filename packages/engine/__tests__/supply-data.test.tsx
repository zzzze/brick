import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/index'
import { Config } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('supply data', () => {
  test('update supply', () => {
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
        <Engine autoCommitMode ref={ref} config={config} />
      </>
    )
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="001-supply.data"]')
      .last()
      .simulate('change', {
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
      _key: '001',
      actions: {},
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
      supply: {
        data: {
          baz: '123',
          bar: '456',
        },
        actions: {},
      },
      version: '0.0.1',
    })
  })

  test('use and update supply', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      supply: {
        data: {
          text: 'foo',
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$global.text}}',
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
        <Engine autoCommitMode ref={ref} config={config} />
      </>
    )
    expect(wrapper.html()).toContain('foo')
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="001-supply.data"]')
      .last()
      .simulate('change', {
        target: {
          name: 'supply',
          value: JSON.stringify({
            text: 123,
          }),
        },
      })
    wrapper.find('[data-testid="001-close-btn"]').last().simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123')
  })

  test('inject supply from data', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
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
          _key: '002',
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$global.text}}',
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
        <Engine autoCommitMode ref={ref} config={config} />
      </>
    )
    expect(wrapper.html()).toContain('baz')
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="001-name-input"]')
      .last()
      .simulate('change', {
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
      _key: '001',
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
          _key: '002',
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$container.text}}',
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
        <Engine autoCommitMode ref={ref} config={config} />
      </>
    )
    expect(wrapper.html()).toContain('baz')
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="001-name-input"]')
      .last()
      .simulate('change', {
        target: {
          name: 'name',
          value: 'bar',
        },
      })
    wrapper.find('[data-testid="001-close-btn"]').last().simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('bar')
  })
})
