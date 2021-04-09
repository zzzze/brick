import React from 'react'
import demoTest from '@brick/tools/tests/demoTest'
import { Engine } from '../src/index'
import { Brick, ChildrenType, BrickInstance } from '../src/types'
import { StringType, NumberType, BooleanType } from '../src/data/data-type'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
  },
  childrenType: ChildrenType.MULTIPLE,
  render(args: BrickInstance) {
    return <div>{args.children}</div>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  dataTypes: {
    content: 'string',
  },
  childrenType: ChildrenType.NONE,
  render(args: BrickInstance) {
    return <span>{args.data.content as string}</span>
  },
  version: '0.0.1',
}

const ViewWithCustomRender: Brick = {
  name: 'ViewWithCustomRender',
  dataTypes: {},
  childrenType: ChildrenType.MULTIPLE,
  canCustomizeRender: true,
  render(args: BrickInstance) {
    void args
    return <></>
  },
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)
Engine.registerBrick(ViewWithCustomRender)

Engine.registerDataType(StringType)
Engine.registerDataType(NumberType)
Engine.registerDataType(BooleanType)

demoTest('engine')
