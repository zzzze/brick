import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('events', () => {
  test('emit event', () => {
    const config: Config = {
      name: 'TextWithOnClickEvent',
      _key: '001',
      listeners: {
        setContent: `function() {
          setData(function(data) {
            return Object.assign({}, data, {
              content: '123456',
            })
          }, {
            setToConfig: true,
          })
        }`,
      },
      handlers: {
        onClick: `function() {
          emit('setContent')
        }`,
      },
      data: {
        content: 'foo',
      },
      version: '0.0.1',
    }
    const ref = React.createRef<Engine>()
    const wrapper = mount(
      <>
        <Engine ref={ref} config={config} />
      </>
    )
    expect(config.data?.['content']).toEqual('foo')
    expect(wrapper.html()).toContain('foo')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.data?.['content']).toEqual('123456')
  })

  test('emit event - use action', () => {
    const config: Config = {
      name: 'TextWithOnClickEvent',
      _key: '001',
      actions: {
        setContent: `function() {
          setData(function(data) {
            return Object.assign({}, data, {
              content: '123456',
            })
          }, {
            setToConfig: true,
          })
        }`,
      },
      listeners: {
        setContent: '{{$this.setContent}}',
      },
      handlers: {
        onClick: `function() {
          emit('setContent')
        }`,
      },
      data: {
        content: 'foo',
      },
      version: '0.0.1',
    }
    const ref = React.createRef<Engine>()
    const wrapper = mount(
      <>
        <Engine ref={ref} config={config} />
      </>
    )
    expect(config.data?.['content']).toEqual('foo')
    expect(wrapper.html()).toContain('foo')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.data?.['content']).toEqual('123456')
  })

  test('emit event - from children', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      data: {
        name: 'foo',
      },
      listeners: {
        setName: `function() {
          setData(function(data) {
            return Object.assign({}, data, {
              name: '123456',
            })
          }, {
            setToConfig: true,
          })
        }`,
      },
      supply: {
        data: {
          name: '{{$this.name}}',
        },
      },
      children: [
        {
          name: 'TextWithOnClickEvent',
          _key: '002',
          handlers: {
            onClick: `function() {
              emit('setName')
            }`,
          },
          data: {
            content: '{{$supply.name}}',
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
    expect(wrapper.html()).toContain('foo')
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })

  test('emit event - from sibling', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      data: {
        name: 'foo',
      },
      children: [
        {
          name: 'View',
          _key: '002',
          data: {
            name: 'foo',
          },
          listeners: {
            setName: `function() {
              setData(function(data) {
                return Object.assign({}, data, {
                  name: '123456',
                })
              }, {
                setToConfig: true,
              })
            }`,
          },
          supply: {
            data: {
              name: '{{$this.name}}',
            },
          },
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$supply.name}}',
              },
              version: '0.0.1',
            },
          ],
          version: '0.0.1',
        },
        {
          name: 'TextWithOnClickEvent',
          _key: '004',
          handlers: {
            onClick: `function() {
              emit('setName')
            }`,
          },
          data: {
            content: 'hello world',
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
    expect(wrapper.html()).toContain('foo')
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })

  test('emit event - from children sibling', () => {
    const config: Config = {
      name: 'View',
      _key: '001',
      children: [
        {
          name: 'View',
          _key: '002',
          data: {
            name: 'foo',
          },
          listeners: {
            setName: `function() {
              setData(function(data) {
                return Object.assign({}, data, {
                  name: '123456',
                })
              }, {
                setToConfig: true,
              })
            }`,
          },
          supply: {
            data: {
              name: '{{$this.name}}',
            },
          },
          children: [
            {
              name: 'Text',
              _key: '003',
              data: {
                content: '{{$supply.name}}',
              },
              version: '0.0.1',
            },
          ],
          version: '0.0.1',
        },
        {
          name: 'View',
          _key: '004',
          children: [
            {
              name: 'TextWithOnClickEvent',
              _key: '005',
              handlers: {
                onClick: `function() {
                  emit('setName')
                }`,
              },
              data: {
                content: 'hello world',
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
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })
})
