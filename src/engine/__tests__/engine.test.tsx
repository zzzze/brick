import React, { ChangeEvent, useCallback } from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import BrickContainer from '@/engine/brick-containter'
import { Brick, ChildrenType, ConfigFormRenderArgs, DataType, RenderArgs } from '@/types'

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
          ...args.value,
          name: event.target.value,
        })
      },
      [args.value]
    )
    return (
      <div>
        edit View: {args.value.name as string}
        <input data-testid="name-input" name="name" value={args.value.name as string} onChange={handleChange} />
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
          ...args.value,
          content: event.target.value,
        })
      },
      [args.value]
    )
    return (
      <div>
        edit Text: {args.value.content as string}
        <input
          data-testid="content-input"
          name="content"
          value={args.value.content as string}
          onChange={handleChange}
        />
      </div>
    )
  },
  render(args: RenderArgs) {
    return <BrickContainer tag="span">{args.value.content as string}</BrickContainer>
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
    return <div>edit Text: {args.value.content}</div>
  },
  render(args) {
    return <BrickContainer tag="span">{args.value.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

describe('Engine', () => {
  beforeEach(() => {
    Engine.registerBrick(View)
    Engine.registerBrick(Text)
    Engine.registerBrick(TextWithDefaultValue)
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
      data: {},
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
      data: {},
      version: '0.0.1',
    })
  })

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

    wrapper.find('textarea[name="supply"]').simulate('change', {
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
      data: {},
      supply: {
        baz: '123',
        bar: '456',
      },
      version: '0.0.1',
    })
  })

  test('use and update supply', () => {
    const config = {
      name: 'View',
      supply: {
        text: 'foo',
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
    wrapper.find('textarea[name="supply"]').simulate('change', {
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
        text: '{{data.name}}',
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
        text: '{{data.name}}',
      },
      children: [
        {
          name: 'View',
          children: [
            {
              name: 'Text',
              data: {
                content: '{{container.text}}',
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
