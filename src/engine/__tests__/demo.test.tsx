import React from 'react'
import demoTest from '@/tools/tests/demoTest'
import Engine from '@/engine'
import { Brick, ChildrenType, ConfigFormRenderProps, PropType, RenderProps } from '@/types'

const View: Brick = {
  name: 'View',
  propTypes: {},
  defaultProps: {},
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm(props: ConfigFormRenderProps) {
    return <div>edit View: {props.children}</div>
  },
  render(props: RenderProps) {
    return <div>{props.children}</div>
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
    return <span>edit Text: {props.value.content as string}</span>
  },
  render(props: RenderProps) {
    return <span>{props.value.content as string}</span>
  },
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)

demoTest('engine')
