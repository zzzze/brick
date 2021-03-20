import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('handlers', () => {
  test('use default action', () => {
    const config: Config = {
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
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('foo')
  })

  test('use custom action - set data at runtime only', () => {
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
              name: 'TextWithOnClickEvent',
              _key: '003',
              data: {
                content: '{{$supply.$container.text}}',
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
        <Engine ref={ref} config={config} />
      </>
    )
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123')
    expect(ref.current?.getConfig()).toMatchObject(config)
  })

  test('use custom action - set data to config', () => {
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
              name: 'TextWithOnClickEvent',
              _key: '003',
              data: {
                content: '{{$supply.$container.text}}',
              },
              handlers: {
                onClick: `function(instance) {
                  instance.setData(function(data) {
                    return Object.assign({}, data, {
                      content: '123',
                    })
                  }, {
                    setToConfig: true,
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
        <Engine ref={ref} config={config} />
      </>
    )
    expect(config.children?.[0].children?.[0].data?.['content']).toEqual('{{$supply.$container.text}}')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.children?.[0].children?.[0].data?.['content']).toEqual('123')
  })
})
