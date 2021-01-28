import React from 'react'
import demoTest from '@/tools/tests/demoTest'
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

Engine.registerBrick(View)
Engine.registerBrick(Text)

demoTest('engine')
