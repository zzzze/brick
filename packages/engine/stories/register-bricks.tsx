import React, { ChangeEvent, useCallback } from 'react'
import { Engine } from '../src'
import { Brick, ChildrenType, ConfigFormRenderArgs, DataType, RenderArgs } from '../src/types'
import { BrickContainer } from '@brick/components'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: DataType.STRING,
  },
  defaultData: {},
  childrenType: ChildrenType.MULTIPLE,
  renderConfigForm(args: ConfigFormRenderArgs) {
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        args.onChange({
          ...args.data,
          name: event.target.value,
        })
      },
      [args.data]
    )
    return (
      <div>
        edit View: {args.data.name as string}
        <input data-testid="name-input" name="name" value={args.data.name as string} onChange={handleChange} />
      </div>
    )
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
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        args.onChange({
          ...args.data,
          content: event.target.value,
        })
      },
      [args.data]
    )
    return (
      <div>
        edit Text: {args.data.content as string}
        <input data-testid="content-input" name="content" value={args.data.content as string} onChange={handleChange} />
      </div>
    )
  },
  render(args: RenderArgs) {
    return <BrickContainer tag="span">{args.data.content as string}</BrickContainer>
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
  renderConfigForm(args) {
    return <div>edit Text: {args.data.content}</div>
  },
  render(args) {
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

Engine.registerBrick(View)
Engine.registerBrick(Text)
Engine.registerBrick(TextWithAction)
