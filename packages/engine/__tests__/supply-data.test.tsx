import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('supply data', () => {
  test('update supply', () => {
    const blueprint: Blueprint = {
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
        <Engine autoCommitMode ref={ref} blueprint={blueprint} />
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
    expect(ref.current?.getBlueprint()).toEqual({
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
      handlers: {},
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
    const blueprint: Blueprint = {
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
          supply: {
            data: {
              text: '{{$parent.text}}',
            },
          },
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$parent.text}}',
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
        <Engine autoCommitMode ref={ref} blueprint={blueprint} />
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
    const blueprint: Blueprint = {
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
          supply: {
            data: {
              text: '{{$parent.text}}',
            },
          },
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$parent.text}}',
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
        <Engine autoCommitMode ref={ref} blueprint={blueprint} />
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
    const blueprint: Blueprint = {
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
        <Engine autoCommitMode ref={ref} blueprint={blueprint} />
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
