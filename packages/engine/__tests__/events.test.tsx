import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'

describe('events', () => {
  test('emit event', () => {
    const config: Config = {
      name: 'TextWithOnClickEvent',
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
    const config: Config[] = [
      {
        name: 'View',
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
    ]
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
    const config: Config[] = [
      {
        name: 'View',
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
        children: [
          {
            name: 'TextWithOnClickEvent',
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
    ]
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
