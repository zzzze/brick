import { BrickInstance, Engine } from '@brick/engine'
import { Brick, ChildrenType } from '@brick/engine'
import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'
import config from './brick.config.json'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
  },
  childrenType: ChildrenType.MULTIPLE,
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
  render(instance: BrickInstance) {
    return <span>{instance.data.content as string}</span>
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
    onClick: `function () {
      setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  render(instance: BrickInstance) {
    const handleClick = useCallback(() => {
      const onClick = instance.handlers['onClick']
      if (onClick) {
        onClick(
          {
            data: instance.data,
            actions: instance.actions,
          },
          instance.context
        )
      }
    }, [])
    return (
      <span>
        <span data-testid="element-with-action" onClick={handleClick}>
          {instance.data.content as string}
        </span>
      </span>
    )
  },
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)
Engine.registerBrick(TextWithAction)

ReactDOM.render(<Engine config={config} />, document.body)
