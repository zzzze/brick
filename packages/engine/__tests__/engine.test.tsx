import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('Engine', () => {
  test('toggle config form', () => {
    const blueprint: Blueprint = {
      name: 'View',
      _key: '001',
      version: '0.0.1',
    }
    const wrapper = mount(<Engine autoCommitMode blueprint={blueprint} />)
    // show
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    expect(wrapper.html()).toContain('edit View')

    // hide
    wrapper.find('[data-testid="001-close-btn"]').last().simulate('click')
    expect(wrapper.html()).not.toContain('edit View')
  })

  test('default data', () => {
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
        {
          name: 'TextWithDefaultValue',
          _key: '003',
          data: {},
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine autoCommitMode blueprint={blueprint} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update value', () => {
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
        <Engine ref={ref} autoCommitMode blueprint={blueprint} />
      </>
    )
    wrapper.find('[data-testid="002-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="002-content-input"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'bar' } })
    expect(ref.current?.getBlueprint()).toEqual({
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
          actions: {},
          handlers: {},
          supply: {
            actions: {},
            data: {},
          },
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
        <Engine ref={ref} autoCommitMode blueprint={blueprint} />
      </>
    )
    wrapper.find('[data-testid="002-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="002-id"]')
      .last()
      .simulate('change', {
        target: {
          name: 'id',
          value: 'baz',
        },
      })
    expect(ref.current?.getBlueprint()).toEqual({
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'Text',
          _key: '002',
          actions: {},
          handlers: {},
          supply: {
            data: {},
            actions: {},
          },
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
        <Engine ref={ref} autoCommitMode blueprint={blueprint} />
      </>
    )
    wrapper.find('[data-testid="001-edit-btn"]').last().simulate('click')
    wrapper
      .find('[data-testid="001-actions"]')
      .last()
      .simulate('change', {
        target: {
          name: 'actions',
          value: JSON.stringify({
            handleClick: 'function(){}',
          }),
        },
      })
    expect(ref.current?.getBlueprint()).toEqual({
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
      handlers: {},
      actions: {
        handleClick: 'function(){}',
      },
      supply: {
        actions: {},
        data: {},
      },
      version: '0.0.1',
    })
  })
})
