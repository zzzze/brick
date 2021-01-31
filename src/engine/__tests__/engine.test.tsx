import React, { ChangeEvent, useCallback } from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import BrickContainer from '@/engine/brick-containter'
import { Brick, ChildrenType, Config, ConfigFormRenderArgs, DataType, RenderArgs } from '@/types'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: DataType.STRING,
  },
  defaultData: {},
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm(args: ConfigFormRenderArgs) {
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        args.onChange({
          ...args.data,
          name: event.target.value,
        })
      },
      [args.data]
    )
    return (
      <div>
        edit View: {args.data.name as string}
        <input data-testid="name-input" name="name" value={args.data.name as string} onChange={handleChange} />
      </div>
    )
  },
  render(args: RenderArgs) {
    return <BrickContainer>{args.children}</BrickContainer>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  dataTypes: {
    content: DataType.STRING,
  },
  defaultData: {
    content: '',
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm(args: ConfigFormRenderArgs) {
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        args.onChange({
          ...args.data,
          content: event.target.value,
        })
      },
      [args.data]
    )
    return (
      <div>
        edit Text: {args.data.content as string}
        <input data-testid="content-input" name="content" value={args.data.content as string} onChange={handleChange} />
      </div>
    )
  },
  render(args: RenderArgs) {
    return <BrickContainer tag="span">{args.data.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

const TextWithDefaultValue: Brick = {
  name: 'TextWithDefaultValue',
  dataTypes: {
    content: DataType.STRING,
  },
  defaultData: {
    content: 'hello world',
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm(args) {
    return <div>edit Text: {args.data.content}</div>
  },
  render(args) {
    return <BrickContainer tag="span">{args.data.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

const TextWithAction: Brick = {
  name: 'TextWithAction',
  dataTypes: {
    content: DataType.STRING,
  },
  defaultData: {
    content: 'hello world',
  },
  childrenType: ChildrenType.NONE,
  actionNames: ['onClick'],
  defaultActions: {
    onClick: `function () {
      setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  renderConfigForm(args) {
    return <div>edit Text: {args.data.content}</div>
  },
  render(args) {
    const handleClick = useCallback(() => {
      const onClick = args.actions['onClick']
      if (onClick) {
        onClick()
      }
    }, [])
    return (
      <BrickContainer tag="span">
        <span data-testid="element-with-action" onClick={handleClick}>
          {args.data.content as string}
        </span>
      </BrickContainer>
    )
  },
  version: '0.0.1',
}

const TextWithAction2: Brick = {
  name: 'TextWithAction2',
  dataTypes: {
    content: DataType.STRING,
  },
  defaultData: {
    content: 'hello world',
  },
  childrenType: ChildrenType.NONE,
  actionNames: ['onClick'],
  defaultActions: {
    onClick: `function () {
      setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  renderConfigForm(args) {
    return <div>edit Text: {args.data.content}</div>
  },
  render(args) {
    const handleClick = useCallback(() => {
      const onClick = args.actions['onClick']
      if (onClick) {
        onClick(args.data, args.supply)
      }
    }, [])
    return (
      <BrickContainer tag="span">
        <span data-testid="element-with-action" onClick={handleClick}>
          {args.data.content as string}
        </span>
      </BrickContainer>
    )
  },
  version: '0.0.1',
}

describe('Engine', () => {
  beforeEach(() => {
    Engine.registerBrick(View)
    Engine.registerBrick(Text)
    Engine.registerBrick(TextWithDefaultValue)
    Engine.registerBrick(TextWithAction)
    Engine.registerBrick(TextWithAction2)
  })

  test('toggle config form', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'hello',
          },
          version: '0.0.1',
        },
        {
          name: 'Text',
          data: {
            content: 'world',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    // show
    wrapper.find('button').at(0).simulate('click')
    expect(wrapper.html()).toContain('edit View')
    wrapper.find('button').at(1).simulate('click')
    expect(wrapper.html()).toContain('edit Text: hello')
    wrapper.find('button').at(2).simulate('click')
    expect(wrapper.html()).toContain('edit Text: world')

    // hide
    wrapper.find('button').at(0).simulate('click')
    expect(wrapper.html()).not.toContain('edit View')
    wrapper.find('button').at(1).simulate('click')
    expect(wrapper.html()).not.toContain('edit Text: hello')
    wrapper.find('button').at(2).simulate('click')
    expect(wrapper.html()).not.toContain('edit Text: world')
  })

  test('default data', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'foo',
          },
          version: '0.0.1',
        },
        {
          name: 'TextWithDefaultValue',
          data: {},
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update value', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
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
        <Engine ref={ref} config={config} />
      </>
    )
    wrapper.find('button[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[data-testid="content-input"]').simulate('change', { target: { name: 'content', value: 'bar' } })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: 'bar',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    })
  })

  test('multiple brick at root', () => {
    const config = [
      {
        name: 'Text',
        data: {
          content: 'foo',
        },
        version: '0.0.1',
      },
      {
        name: 'TextWithDefaultValue',
        data: {},
        version: '0.0.1',
      },
      {
        name: 'View',
        children: [
          {
            name: 'Text',
            data: {
              content: 'hello',
            },
            version: '0.0.1',
          },
          {
            name: 'Text',
            data: {
              content: 'world',
            },
            version: '0.0.1',
          },
        ],
        version: '0.0.1',
      },
    ]
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('hello world')
  })

  test('update id', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
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
        <Engine ref={ref} config={config} />
      </>
    )
    wrapper.find('button[data-testid="edit-btn"]').at(1).simulate('click')
    wrapper.find('input[name="id"]').simulate('change', {
      target: {
        name: 'id',
        value: 'baz',
      },
    })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
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

  describe('supply', () => {
    test('update supply', () => {
      const config = {
        name: 'View',
        children: [
          {
            name: 'Text',
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
          <Engine ref={ref} config={config} />
        </>
      )
      wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
      wrapper.find('textarea[name="supply.data"]').simulate('change', {
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
        children: [
          {
            name: 'Text',
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
      const config = {
        name: 'View',
        supply: {
          data: {
            text: 'foo',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{text}}',
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
      wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
      wrapper.find('textarea[name="supply.data"]').simulate('change', {
        target: {
          name: 'supply',
          value: JSON.stringify({
            text: 123,
          }),
        },
      })
      wrapper.find('button[data-testid="close-btn"]').at(0).simulate('click')
      expect(wrapper.html()).not.toContain('foo')
      expect(wrapper.html()).toContain('123')
    })

    test('inject supply from data', () => {
      const config = {
        name: 'View',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{text}}',
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
      wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
      wrapper.find('input[data-testid="name-input"]').simulate('change', {
        target: {
          name: 'name',
          value: 'bar',
        },
      })
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('bar')
    })

    test('inject supply from data and use id as namespace', () => {
      const config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{$$container.text}}',
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
      wrapper.find('button[data-testid="edit-btn"]').at(0).simulate('click')
      wrapper.find('input[data-testid="name-input"]').simulate('change', {
        target: {
          name: 'name',
          value: 'bar',
        },
      })
      wrapper.find('button[data-testid="close-btn"]').at(0).simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('bar')
    })
  })

  describe('action', () => {
    test('use default action', () => {
      const config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'TextWithAction',
                data: {
                  content: '{{$$container.text}}',
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
      const config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'TextWithAction',
                data: {
                  content: '{{$$container.text}}',
                },
                actions: {
                  onClick: `function() {
                    setData(function(data) {
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
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'TextWithAction',
                data: {
                  content: '{{$$container.text}}',
                },
                actions: {
                  onClick: `function() {
                    setData(function(data) {
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
      expect(config.children?.[0].children?.[0].data?.['content']).toEqual('{{$$container.text}}')
      expect(wrapper.html()).toContain('baz')
      wrapper.find('span[data-testid="element-with-action"]').simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('123')
      const config2 = ref.current?.getConfig() as Config
      expect(config2.children?.[0].children?.[0].data?.['content']).toEqual('123')
    })
  })

  describe('actions supply', () => {
    test('trigger action from supply', () => {
      const config: Config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
        },
        children: [
          {
            name: 'View',
            id: 'container2',
            data: {
              name: '{{$$container.text}}',
            },
            supply: {
              data: {
                content: '{{data.name}}',
              },
              actions: {
                onClick: `function() {
                  setData(function(data) {
                    return Object.assign({}, data, {
                      name: '123456',
                    })
                  }, {
                    setToConfig: true,
                  })
                }`,
              },
            },
            children: [
              {
                name: 'TextWithAction',
                actions: {
                  onClick: '{{$$container2.onClick}}',
                },
                data: {
                  content: '{{$$container2.content}}',
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
      expect(config.children?.[0].data?.['name']).toEqual('{{$$container.text}}')
      expect(wrapper.html()).toContain('baz')
      wrapper.find('span[data-testid="element-with-action"]').simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('123456')
      const config2 = ref.current?.getConfig() as Config
      expect(config2.children?.[0].data?.['name']).toEqual('123456')
    })

    test('data action between sibling', () => {
      const config: Config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
          actions: {
            onClick: `function() {
              setData(function(data) {
                return Object.assign({}, data, {
                  name: '123456',
                })
              }, {
                setToConfig: true,
              })
            }`,
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'TextWithAction',
                actions: {
                  onClick: '{{$$container.onClick}}',
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
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{$$container.text}}',
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
      expect(config.data?.['name']).toEqual('baz')
      expect(wrapper.html()).toContain('baz')
      wrapper.find('span[data-testid="element-with-action"]').simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('123456')
      const config2 = ref.current?.getConfig() as Config
      expect(config2.data?.['name']).toEqual('123456')
    })

    test('trigger action with param', () => {
      const config: Config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
          actions: {
            onClick: `function(name) {
              setData(function(data) {
                return Object.assign({}, data, {
                  name: name,
                })
              }, {
                setToConfig: true,
              })
            }`,
          },
        },
        children: [
          {
            name: 'View',
            children: [
              {
                name: 'TextWithAction2',
                actions: {
                  onClick: `function(data, supply) {
                    supply.actions.$$container.onClick(data.content)
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
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{$$container.text}}',
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
      expect(config.data?.['name']).toEqual('baz')
      expect(wrapper.html()).toContain('baz')
      wrapper.find('span[data-testid="element-with-action"]').simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('123456789')
      const config2 = ref.current?.getConfig() as Config
      expect(config2.data?.['name']).toEqual('123456789')
    })

    test('trigger action provided by supply with param', () => {
      const config: Config = {
        name: 'View',
        id: 'container',
        data: {
          name: 'baz',
        },
        supply: {
          data: {
            text: '{{data.name}}',
          },
          actions: {
            onClick: `function(name) {
              setData(function(data) {
                return Object.assign({}, data, {
                  name: name,
                })
              }, {
                setToConfig: true,
              })
            }`,
          },
        },
        children: [
          {
            name: 'View',
            id: 'container2',
            supply: {
              actions: {
                onClick: '{{supply.$$container.onClick}}',
              },
            },
            children: [
              {
                name: 'TextWithAction2',
                actions: {
                  onClick: `function(data, supply) {
                    supply.actions.$$container2.onClick(data.content)
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
            children: [
              {
                name: 'Text',
                data: {
                  content: '{{$$container.text}}',
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
      expect(config.data?.['name']).toEqual('baz')
      expect(wrapper.html()).toContain('baz')
      wrapper.find('span[data-testid="element-with-action"]').simulate('click')
      expect(wrapper.html()).not.toContain('baz')
      expect(wrapper.html()).toContain('123456789')
      const config2 = ref.current?.getConfig() as Config
      expect(config2.data?.['name']).toEqual('123456789')
    })
  })
})
