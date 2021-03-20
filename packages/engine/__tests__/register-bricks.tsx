import React, { useCallback } from 'react'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Brick, ChildrenType, BrickInstance } from '@/types'
import { ConfigurationFormItem as FormItem } from '@brick/components'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
  },
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm() {
    return (
      <FormItem label="edit View: " name="name">
        <input data-testid="name-input" />
      </FormItem>
    )
  },
  render(instance: BrickInstance) {
    return <div>{instance.children}</div>
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
  render(instance: BrickInstance) {
    return <span>{instance.data.content as string}</span>
  },
  version: '0.0.1',
}

const TextWithDefaultValue: Brick = {
  name: 'TextWithDefaultValue',
  dataTypes: {
    content: {
      type: 'string',
      default: 'hello world',
    },
  },
  childrenType: ChildrenType.NONE,
  renderConfigForm() {
    return (
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
      </FormItem>
    )
  },
  render(instance: BrickInstance) {
    return <span>{instance.data.content as string}</span>
  },
  version: '0.0.1',
}

const TextWithOnClickEvent: Brick = {
  name: 'TextWithOnClickEvent',
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
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
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

const TextWithAction2: Brick = {
  name: 'TextWithAction2',
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
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
      </FormItem>
    )
  },
  render(instance: BrickInstance) {
    const handleClick = useCallback(() => {
      const onClick = instance.handlers['onClick']
      if (onClick) {
        onClick()
      }
    }, [])
    return (
      <span data-testid="element-with-action" onClick={handleClick}>
        {instance.data.content as string}
      </span>
    )
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
  render(instance: BrickInstance) {
    void instance
    return <></>
  },
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)
Engine.registerBrick(TextWithDefaultValue)
Engine.registerBrick(TextWithOnClickEvent)
Engine.registerBrick(TextWithAction2)
Engine.registerBrick(ViewWithCustomRender)
