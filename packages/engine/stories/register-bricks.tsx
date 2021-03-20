import React from 'react'
import { Engine } from '../src'
import { Brick, ChildrenType, BrickInstance } from '../src/types'
import { ConfigurationFormItem as FormItem } from '@brick/components'
import { StringType, NumberType, BooleanType } from '../src/data/data-type'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
  },
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm() {
    return (
      <FormItem label="name" name="name">
        <input />
      </FormItem>
    )
  },
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
  canCustomizeRender: true,
  renderConfigForm() {
    return (
      <FormItem label="content" name="content">
        <input />
      </FormItem>
    )
  },
  render(instance: BrickInstance) {
    return <span>{instance.data.content as string}</span>
  },
  version: '0.0.1',
}

const Image: Brick = {
  name: 'Image',
  dataTypes: {
    src: 'string',
  },
  childrenType: ChildrenType.NONE,
  canCustomizeRender: true,
  renderConfigForm() {
    return (
      <FormItem label="src" name="src">
        <input />
      </FormItem>
    )
  },
  render(args: BrickInstance) {
    return <img style={{ width: 100 }} src={args.data.src as string} />
  },
  version: '0.0.1',
}

const Input: Brick = {
  name: 'Input',
  dataTypes: {},
  childrenType: ChildrenType.NONE,
  renderConfigForm() {
    return (
      <FormItem label="src" name="src">
        <input />
      </FormItem>
    )
  },
  eventNames: ['onChange'],
  render(instance: BrickInstance) {
    return <input onChange={instance.handlers['onChange']} />
  },
  version: '0.0.1',
}

const TextWithAction: Brick = {
  name: 'TextWithAction',
  dataTypes: {
    content: 'string',
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
  renderConfigForm() {
    return (
      <FormItem label="content" name="content">
        <input />
      </FormItem>
    )
  },
  render(instance: BrickInstance) {
    return (
      <span data-testid="element-with-action" onClick={instance.handlers['onClick']}>
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
}
