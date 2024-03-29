import React, { useCallback } from 'react'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Brick, ChildrenType, BrickInstance } from '../src/types'

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
  render(this: BrickInstance) {
    return <div>{this.children}</div>
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions'],
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
  render(this: BrickInstance) {
    return <span>{this.data.content as string}</span>
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions'],
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
  render(this: BrickInstance) {
    return <span>{this.data.content as string}</span>
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions'],
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
    onClick: `function () {
      this.setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  render(this: BrickInstance) {
    return (
      <span data-testid="element-with-action" onClick={this.handlers['onClick']}>
        {this.data.content as string}
      </span>
    )
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions'],
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
    onClick: `function () {
      this.setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  render(this: BrickInstance) {
    const handleClick = useCallback(() => {
      const onClick = this.handlers['onClick']
      if (onClick) {
        onClick()
      }
    }, [])
    return (
      <span data-testid="element-with-action" onClick={handleClick}>
        {this.data.content as string}
      </span>
    )
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions'],
  version: '0.0.1',
}

const ViewWithCustomRender: Brick = {
  name: 'ViewWithCustomRender',
  dataTypes: {},
  childrenType: ChildrenType.MULTIPLE,
  render() {
    return <></>
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions', 'render'],
  version: '0.0.1',
}

Engine.registerBrick(View)
Engine.registerBrick(Text)
Engine.registerBrick(TextWithDefaultValue)
Engine.registerBrick(TextWithOnClickEvent)
Engine.registerBrick(TextWithAction2)
Engine.registerBrick(ViewWithCustomRender)
