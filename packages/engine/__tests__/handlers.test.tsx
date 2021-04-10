import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('handlers', () => {
  test('use default action', () => {
    const blueprint: Blueprint = {
      name: 'View',
      id: 'container',
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
              name: 'TextWithOnClickEvent',
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('foo')
  })

  test('use custom action - set data at runtime only', () => {
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
              name: 'TextWithOnClickEvent',
              _key: '003',
              data: {
                content: '{{$container.text}}',
              },
              handlers: {
                onClick: `function(instance) {
                  instance.setData(function(data) {
                    return Object.assign({}, data, {
                      content: '123',
                    })
                  })
                }`,
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123')
    expect(ref.current?.getBlueprint()).toMatchObject(blueprint)
  })

  test('use custom action - set data to config', () => {
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
              name: 'TextWithOnClickEvent',
              _key: '003',
              data: {
                content: '{{$container.text}}',
              },
              handlers: {
                onClick: `function(instance) {
                  instance.setData(function(data) {
                    return Object.assign({}, data, {
                      content: '123',
                    })
                  }, {
                    setToBlueprint: true,
                  })
                }`,
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(blueprint.children?.[0].children?.[0].data?.['content']).toEqual('{{$container.text}}')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.children?.[0].children?.[0].data?.['content']).toEqual('123')
  })
})
