import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import BrickContainer from '@/engine/brick-containter'
import { Brick, ChildrenType, ConfigFormRenderProps, PropType, RenderProps } from '@/types'

const View: Brick = {
  name: 'View',
  propTypes: {},
  defaultProps: {},
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm(props: ConfigFormRenderProps) {
    return <BrickContainer>edit View: {props.children}</BrickContainer>
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
    return <BrickContainer tag="span">edit Text: {props.value.content as string}</BrickContainer>
  },
  render(props: RenderProps) {
    return <BrickContainer tag="span">{props.value.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

describe('Engine', () => {
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
    props: {},
    version: '0.0.1',
  }
  beforeEach(() => {
    Engine.registerBrick(View)
    Engine.registerBrick(Text)
  })

  test('toggle config form', () => {
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
})
