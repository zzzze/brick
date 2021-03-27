import React from 'react'
import { Engine } from '../src'
import { Brick, ChildrenType, BrickInstance } from '../src/types'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '../src/data/data-type'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
    style: 'object',
  },
  childrenType: ChildrenType.MULTIPLE,
  render(instance: BrickInstance) {
    return <div style={instance.data.style as React.CSSProperties}>{instance.children}</div>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  dataTypes: {
    content: 'string',
    style: 'object',
  },
  childrenType: ChildrenType.NONE,
  canCustomizeRender: true,
  render(instance: BrickInstance) {
    return <span style={instance.data.style as React.CSSProperties}>{instance.data.content as string}</span>
  },
  version: '0.0.1',
}

const Image: Brick = {
  name: 'Image',
  dataTypes: {
    src: 'string',
    style: 'object',
  },
  childrenType: ChildrenType.NONE,
  canCustomizeRender: true,
  render(instance: BrickInstance) {
    return <img style={instance.data.style as React.CSSProperties} src={instance.data.src as string} />
  },
  version: '0.0.1',
}

const Input: Brick = {
  name: 'Input',
  dataTypes: {
    style: 'object',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onChange'],
  render(instance: BrickInstance) {
    return <input style={instance.data.style as React.CSSProperties} onChange={instance.handlers['onChange']} />
  },
  version: '0.0.1',
}

const TextWithAction: Brick = {
  name: 'TextWithAction',
  dataTypes: {
    content: 'string',
    style: 'object',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onClick'],
  defaultHandlers: {
    onClick: `function (instance) {
      instance.setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  render(instance: BrickInstance) {
    return (
      <span
        style={instance.data.style as React.CSSProperties}
        data-testid="element-with-action"
        onClick={instance.handlers['onClick']}>
        {instance.data.content as string}
      </span>
    )
  },
  version: '0.0.1',
}

export default (): void => {
  Engine.registerBrick(View)
  Engine.registerBrick(Text)
  Engine.registerBrick(Image)
  Engine.registerBrick(Input)
  Engine.registerBrick(TextWithAction)

  Engine.registerDataType(StringType)
  Engine.registerDataType(NumberType)
  Engine.registerDataType(BooleanType)
  Engine.registerDataType(ObjectType)
  Engine.registerDataType(CodeType)
}
