import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'
import './register-data-types'

React.useLayoutEffect = React.useEffect

describe('supply actions', () => {
  test('trigger action from supply', () => {
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
          id: 'container2',
          data: {
            name: '{{$container.text}}',
          },
          supply: {
            data: {
              content: '{{$this.name}}',
            },
            actions: {
              onClick: `function(instance) {
                instance.setData(function(data) {
                  return Object.assign({}, data, {
                    name: '123456',
                  })
                }, {
                  setToBlueprint: true,
                })
              }`,
            },
          },
          children: [
            {
              name: 'TextWithOnClickEvent',
              _key: '003',
              handlers: {
                onClick: '{{$container2.onClick}}',
              },
              data: {
                content: '{{$container2.content}}',
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
    expect(blueprint.children?.[0].data?.['name']).toEqual('{{$container.text}}')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.children?.[0].data?.['name']).toEqual('123456')
  })

  test('trigger global action from supply', async () => {
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
        actions: {
          onClick: `function() {}`,
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          data: {
            name: '{{$container.text}}',
          },
          supply: {
            data: {
              content: '{{$this.name}}',
            },
            actions: {
              onClick: `function(instance) {
                instance.setData(function(data) {
                  return Object.assign({}, data, {
                    name: '123456',
                  })
                }, {
                  setToBlueprint: true,
                })
              }`,
            },
          },
          children: [
            {
              name: 'TextWithOnClickEvent',
              _key: '003',
              handlers: {
                onClick: '{{$global.onClick}}',
              },
              data: {
                content: '{{$global.content}}',
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
    expect(blueprint.children?.[0].data?.['name']).toEqual('{{$container.text}}')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.children?.[0].data?.['name']).toEqual('123456')
  })

  test('data action between sibling', () => {
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
        actions: {
          onClick: `function(instance) {
            instance.setData(function(data) {
              return Object.assign({}, data, {
                name: '123456',
              })
            }, {
              setToBlueprint: true,
            })
          }`,
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
              handlers: {
                onClick: '{{$container.onClick}}',
              },
              data: {
                content: 'foo',
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
              name: 'Text',
              _key: '005',
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
    expect(blueprint.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['name']).toEqual('123456')
  })

  test('trigger action with param', () => {
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
        actions: {
          onClick: `function(instance, name) {
            instance.setData(function(data) {
              return Object.assign({}, data, {
                name: name,
              })
            }, {
              setToBlueprint: true,
            })
          }`,
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          children: [
            {
              name: 'TextWithAction2',
              _key: '003',
              handlers: {
                onClick: `function(instance) {
                  instance.context.actions.$container.onClick(instance.data.content)
                }`,
              },
              data: {
                content: '123456789',
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
              name: 'Text',
              _key: '005',
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
    expect(blueprint.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['name']).toEqual('123456789')
  })

  test('trigger action provided by supply with param', () => {
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
        actions: {
          onClick: `function(instance, name) {
            instance.setData(function(data) {
              return Object.assign({}, data, {
                name: name,
              })
            }, {
              setToBlueprint: true,
            })
          }`,
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          id: 'container2',
          supply: {
            actions: {
              onClick: '{{$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              _key: '003',
              handlers: {
                onClick: `function(instance) {
                  instance.context.actions.$container2.onClick(instance.data.content)
                }`,
              },
              data: {
                content: '123456789',
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
              name: 'Text',
              _key: '005',
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
    expect(blueprint.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['name']).toEqual('123456789')
  })

  test('use action as handler', () => {
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
        actions: {
          onClick: `function(instance, name) {
            instance.setData(function(data) {
              return Object.assign({}, data, {
                name: name,
              })
            }, {
              setToBlueprint: true,
            })
          }`,
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          id: 'container2',
          supply: {
            actions: {
              onClick: '{{$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              _key: '003',
              actions: {
                handleClick: `function(instance) {
                  instance.context.actions.$container2.onClick(instance.data.content)
                }`,
              },
              handlers: {
                onClick: '{{$this.handleClick}}',
              },
              data: {
                content: '123456789',
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
              name: 'Text',
              _key: '005',
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
    expect(blueprint.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['name']).toEqual('123456789')
  })

  test('invoke action in another action', () => {
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
        actions: {
          onClick: `function(instance, name) {
            instance.setData(function(data) {
              return Object.assign({}, data, {
                name: name,
              })
            }, {
              setToBlueprint: true,
            })
          }`,
        },
      },
      children: [
        {
          name: 'View',
          _key: '002',
          id: 'container2',
          supply: {
            actions: {
              onClick: '{{$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              _key: '003',
              actions: {
                click: `function(instance) {
                  instance.context.actions.$container2.onClick(instance.data.content)
                }`,
                handleClick: `function(instance) {
                  instance.actions.click()
                }`,
              },
              handlers: {
                onClick: '{{$this.handleClick}}',
              },
              data: {
                content: '123456789',
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
              name: 'Text',
              _key: '005',
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
    expect(blueprint.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getBlueprint() as Blueprint
    expect(config2.data?.['name']).toEqual('123456789')
  })
})
