import React, { useCallback } from 'react'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Brick, ChildrenType, BrickInstance } from '@/types'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: {
      type: 'string',
      default: '',
      label: 'edit View: ',
      testID: 'name-input',
    },
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
    content: {
      type: 'string',
      default: '',
      label: 'edit Text: ',
      testID: 'content-input',
    },
  },
  childrenType: ChildrenType.NONE,
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
      label: 'edit Text: ',
      testID: 'content-input',
    },
  },
  childrenType: ChildrenType.NONE,
  render(instance: BrickInstance) {
    return <span>{instance.data.content as string}</span>
  },
  version: '0.0.1',
}

const TextWithOnClickEvent: Brick = {
  name: 'TextWithOnClickEvent',
  dataTypes: {
    content: {
      type: 'string',
      default: '',
      label: 'edit Text: ',
      testID: 'content-input',
    },
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
    content: {
      type: 'string',
      default: '',
      label: 'edit Text: ',
      testID: 'content-input',
    },
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
