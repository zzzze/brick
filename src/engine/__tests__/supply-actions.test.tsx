import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import { Config } from '@/types'
import './register-bricks'

describe('supply actions', () => {
  test('trigger action from supply', () => {
    const config: Config = {
      name: 'View',
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
          id: 'container2',
          data: {
            name: '{{$supply.$container.text}}',
          },
          supply: {
            data: {
              content: '{{$this.name}}',
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
              handlers: {
                onClick: '{{$supply.$container2.onClick}}',
              },
              data: {
                content: '{{$supply.$container2.content}}',
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
    expect(config.children?.[0].data?.['name']).toEqual('{{$supply.$container.text}}')
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
          text: '{{$this.name}}',
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
              handlers: {
                onClick: '{{$supply.$container.onClick}}',
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
          text: '{{$this.name}}',
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
              handlers: {
                onClick: `function($this, $supply) {
                  $supply.actions.$container.onClick($this.data.content)
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
          text: '{{$this.name}}',
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
              onClick: '{{$supply.$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              handlers: {
                onClick: `function($this, $supply) {
                  $supply.actions.$container2.onClick($this.data.content)
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
    expect(config.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.data?.['name']).toEqual('123456789')
  })

  test('use action as handler', () => {
    const config: Config = {
      name: 'View',
      id: 'container',
      data: {
        name: 'baz',
      },
      supply: {
        data: {
          text: '{{$this.name}}',
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
              onClick: '{{$supply.$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              actions: {
                handleClick: `function($this, $supply) {
                  $supply.actions.$container2.onClick($this.data.content)
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
          children: [
            {
              name: 'Text',
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
    expect(config.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.data?.['name']).toEqual('123456789')
  })

  test('invoke action in another action', () => {
    const config: Config = {
      name: 'View',
      id: 'container',
      data: {
        name: 'baz',
      },
      supply: {
        data: {
          text: '{{$this.name}}',
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
              onClick: '{{$supply.$container.onClick}}',
            },
          },
          children: [
            {
              name: 'TextWithAction2',
              actions: {
                click: `function($this, $supply) {
                  $supply.actions.$container2.onClick($this.data.content)
                }`,
                handleClick: `function($this, $supply) {
                  $this.actions.click($this, $supply)
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
          children: [
            {
              name: 'Text',
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
    expect(config.data?.['name']).toEqual('baz')
    expect(wrapper.html()).toContain('baz')
    wrapper.find('span[data-testid="element-with-action"]').simulate('click')
    expect(wrapper.html()).not.toContain('baz')
    expect(wrapper.html()).toContain('123456789')
    const config2 = ref.current?.getConfig() as Config
    expect(config2.data?.['name']).toEqual('123456789')
  })
})
