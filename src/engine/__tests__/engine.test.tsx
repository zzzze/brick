import React, { ChangeEvent, useCallback } from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import BrickContainer from '@/engine/brick-containter'
import { Brick, ChildrenType, ConfigFormRenderProps, PropType, RenderProps } from '@/types'
import ObjectStringInput from '@/components/object-string-input'

const View: Brick = {
  name: 'View',
  propTypes: {},
  defaultProps: {},
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm(props: ConfigFormRenderProps) {
    return <div>edit View: {props.children}</div>
  },
  render(props: RenderProps) {
    return <BrickContainer>{props.children}</BrickContainer>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  propTypes: {
    content: PropType.STRING,
  },
  defaultProps: {
    content: '',
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm(props: ConfigFormRenderProps) {
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        props.onChange({
          ...props.value,
          content: event.target.value,
        })
      },
      [props.value]
    )
    return (
      <div>
        edit Text: {props.value.content as string}
        <input
          data-testid="content-input"
          name="content"
          value={props.value.content as string}
          onChange={handleChange}
        />
      </div>
    )
  },
  render(props: RenderProps) {
    return <BrickContainer tag="span">{props.value.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

const TextWithDefaultValue: Brick = {
  name: 'TextWithDefaultValue',
  propTypes: {
    content: PropType.STRING,
  },
  defaultProps: {
    content: 'hello world',
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm(props) {
    return <div>edit Text: {props.value.content}</div>
  },
  render(props) {
    return <BrickContainer tag="span">{props.value.content as string}</BrickContainer>
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
          props: {
            content: 'hello',
          },
          version: '0.0.1',
        },
        {
          name: 'Text',
          props: {
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

  test('default props', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          props: {
            content: 'foo',
          },
          version: '0.0.1',
        },
        {
          name: 'TextWithDefaultValue',
          props: {},
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
          props: {
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
          props: {
            content: 'bar',
          },
          version: '0.0.1',
        },
      ],
      props: {},
      version: '0.0.1',
    })
  })

  test('multiple brick at root', () => {
    const config = [
      {
        name: 'Text',
        props: {
          content: 'foo',
        },
        version: '0.0.1',
      },
      {
        name: 'TextWithDefaultValue',
        props: {},
        version: '0.0.1',
      },
      {
        name: 'View',
        children: [
          {
            name: 'Text',
            props: {
              content: 'hello',
            },
            version: '0.0.1',
          },
          {
            name: 'Text',
            props: {
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
          props: {
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
          props: {
            content: 'foo',
          },
          id: 'baz',
          version: '0.0.1',
        },
      ],
      props: {},
      version: '0.0.1',
    })
  })

  test('update supply', () => {
    const config = {
      name: 'View',
      children: [
        {
          name: 'Text',
          props: {
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
    const onChange = wrapper.find(ObjectStringInput).props().onChange
    onChange &&
      onChange({
        target: {
          name: 'supply',
          value: {
            baz: '123',
            bar: '456',
          },
        },
      })
    expect(ref.current?.getConfig()).toEqual({
      name: 'View',
      children: [
        {
          name: 'Text',
          props: {
            content: 'foo',
          },
          version: '0.0.1',
        },
      ],
      props: {},
      supply: {
        baz: '123',
        bar: '456',
      },
      version: '0.0.1',
    })
  })
})
