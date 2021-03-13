import React, { useCallback } from 'react'
import 'jest-enzyme'
import { Engine } from '@/index'
import { BrickContainer } from '@brick/components'
import { Brick, ChildrenType, DataType, BrickInstance } from '@/types'
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
      <FormItem label="edit View: " name="name">
        <input data-testid="name-input" />
      </FormItem>
    )
  },
  render(args: BrickInstance) {
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

const TextWithDefaultValue: Brick = {
  name: 'TextWithDefaultValue',
  dataTypes: {
    content: DataType.STRING,
  },
  defaultData: {
    content: 'hello world',
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

const TextWithOnClickEvent: Brick = {
  name: 'TextWithOnClickEvent',
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
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
      </FormItem>
    )
  },
  render(args: BrickInstance) {
    const handleClick = useCallback(() => {
      const onClick = args.handlers['onClick']
      if (onClick) {
        onClick()
      }
    }, [])
    return (
      <BrickContainer tag="span">
        <span data-testid="element-with-action" onClick={handleClick}>
          {args.data.content as string}
        </span>
      </BrickContainer>
    )
  },
  version: '0.0.1',
}

const TextWithAction2: Brick = {
  name: 'TextWithAction2',
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
      <FormItem label="edit Text: " name="content">
        <input data-testid="content-input" />
      </FormItem>
    )
  },
  render(args: BrickInstance) {
    const handleClick = useCallback(() => {
      const onClick = args.handlers['onClick']
      if (onClick) {
        onClick(
          {
            data: args.data,
            actions: args.actions,
          },
          args.supply
        )
      }
    }, [])
    return (
      <BrickContainer tag="span">
        <span data-testid="element-with-action" onClick={handleClick}>
          {args.data.content as string}
        </span>
      </BrickContainer>
    )
  },
  version: '0.0.1',
}

const ViewWithCustomRender: Brick = {
  name: 'ViewWithCustomRender',
  dataTypes: {},
  defaultData: {},
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
Engine.registerBrick(TextWithDefaultValue)
Engine.registerBrick(TextWithOnClickEvent)
Engine.registerBrick(TextWithAction2)
Engine.registerBrick(ViewWithCustomRender)
