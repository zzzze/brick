import React from 'react'
import demoTest from '@/tools/tests/demoTest'
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
    return <div>edit View: {args.children}</div>
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
    return <div>edit Text: {args.value.content as string}</div>
  },
  render(args: RenderArgs) {
    return <BrickContainer tag="span">{args.value.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)

demoTest('engine')
