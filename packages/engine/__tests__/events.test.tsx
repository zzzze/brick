import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('events', () => {
  test('emit event', () => {
    const blueprint: Blueprint = {
      name: 'TextWithOnClickEvent',
      _key: '001',
      listeners: {
        setContent: `function(instance) {
          instance.setData(function(data) {
            return Object.assign({}, data, {
              content: '123456',
            })
          }, {
            setToBlueprint: true,
          })
        }`,
      },
      handlers: {
        onClick: `function(instance) {
          instance.emit('setContent')
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(blueprint.data?.['content']).toEqual('foo')
    expect(wrapper.html()).toContain('foo')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['content']).toEqual('123456')
  })

  test('emit event - use action', () => {
    const blueprint: Blueprint = {
      name: 'TextWithOnClickEvent',
      _key: '001',
      actions: {
        setContent: `function(instance) {
          instance.setData(function(data) {
            return Object.assign({}, data, {
              content: '123456',
            })
          }, {
            setToBlueprint: true,
          })
        }`,
      },
      listeners: {
        setContent: '{{$this.setContent}}',
      },
      handlers: {
        onClick: `function(instance) {
          instance.emit('setContent')
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(blueprint.data?.['content']).toEqual('foo')
    expect(wrapper.html()).toContain('foo')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['content']).toEqual('123456')
  })

  test('emit event - from children', () => {
    const blueprint: Blueprint = {
      name: 'View',
      _key: '001',
      data: {
        name: 'foo',
      },
      listeners: {
        setName: `function(instance) {
          instance.setData(function(data) {
            return Object.assign({}, data, {
              name: '123456',
            })
          }, {
            setToBlueprint: true,
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
            onClick: `function(instance) {
              instance.emit('setName')
            }`,
          },
          data: {
            content: '{{$parent.name}}',
          },
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
    expect(wrapper.html()).toContain('foo')
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })

  test('emit event - from sibling', () => {
    const blueprint: Blueprint = {
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
            setName: `function(instance) {
              instance.setData(function(data) {
                return Object.assign({}, data, {
                  name: '123456',
                })
              }, {
                setToBlueprint: true,
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
                content: '{{$parent.name}}',
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
            onClick: `function(instance) {
              instance.emit('setName')
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(wrapper.html()).toContain('foo')
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })

  test('emit event - from children sibling', () => {
    const blueprint: Blueprint = {
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
            setName: `function(instance) {
              instance.setData(function(data) {
                return Object.assign({}, data, {
                  name: '123456',
                })
              }, {
                setToBlueprint: true,
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
                content: '{{$parent.name}}',
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
                onClick: `function(instance) {
                  instance.emit('setName')
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
        <Engine ref={ref} blueprint={blueprint} />
      </>
    )
    expect(wrapper.html()).toContain('foo')
    expect(wrapper.html()).not.toContain('123456')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('foo')
    expect(wrapper.html()).toContain('123456')
  })
})
