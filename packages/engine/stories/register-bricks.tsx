import React from 'react'
import { Engine } from '../src'
import { Brick, ChildrenType, DataType, BrickInstance } from '../src/types'
import { ConfigurationFormItem as FormItem } from '@brick/components'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: DataType.STRING,
  },
  defaultData: {},
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
    content: DataType.STRING,
  },
  defaultData: {
    content: '',
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
    src: DataType.STRING,
  },
  defaultData: {
    src: '',
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
  defaultData: {},
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
    content: DataType.STRING,
  },
  defaultData: {
    content: 'hello world',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onClick'],
  defaultHandlers: {
    onClick: `function () {
      setData(function(data) {
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
}
