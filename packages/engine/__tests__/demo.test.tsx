import React from 'react'
import demoTest from '@brick/tools/tests/demoTest'
import { Engine } from '@/index'
import { BrickContainer } from '@brick/components'
import { Brick, ChildrenType, BrickInstance } from '@/types'
import { ConfigurationFormItem as FormItem } from '@brick/components'
import { StringType, NumberType, BooleanType } from '../src/data/data-type'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
  },
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm() {
    return <></>
  },
  render(args: BrickInstance) {
    return <BrickContainer>{args.children}</BrickContainer>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  dataTypes: {
    content: 'string',
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm() {
    return (
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
      </FormItem>
    )
  },
  render(args: BrickInstance) {
    return <BrickContainer tag="span">{args.data.content as string}</BrickContainer>
  },
  version: '0.0.1',
}

const ViewWithCustomRender: Brick = {
  name: 'ViewWithCustomRender',
  dataTypes: {},
  childrenType: ChildrenType.MULTIPLE,
  canCustomizeRender: true,
  renderConfigForm() {
    return <></>
  },
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
