import { Engine } from '@brick/engine'
import { BrickContainer, ConfigurationFormItem as FormItem } from '@brick/components'
import { Brick, ChildrenType, DataType, RenderArgs } from '@brick/engine'
import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'
import config from './brick.config.json'

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
  renderConfigForm() {
    return (
      <FormItem label="content" name="content">
        <input />
      </FormItem>
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
  renderConfigForm() {
    return (
      <FormItem label="content" name="content">
        <input />
      </FormItem>
    )
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

ReactDOM.render(<Engine config={config} />, document.body)
