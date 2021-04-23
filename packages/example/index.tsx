import { BrickInstance, Engine } from '@brick/engine'
import { Brick, ChildrenType } from '@brick/engine'
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import blueprint from './brick.config.json'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '@brick/engine'

const View: Brick = {
  name: 'View',
  dataTypes: {
    name: 'string',
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.MULTIPLE,
  render(instance: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return <div style={style}>{instance.children}</div>
  },
  renderMenu() {
    return <div>View</div>
  },
  version: '0.0.1',
}

const Text: Brick = {
  name: 'Text',
  dataTypes: {
    content: 'string',
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.NONE,
  canCustomizeRender: true,
  render(instance: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return <span style={style}>{instance.data.content as string}</span>
  },
  renderMenu() {
    return <div>Text</div>
  },
  version: '0.0.1',
}

const Image: Brick = {
  name: 'Image',
  dataTypes: {
    src: 'string',
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.NONE,
  canCustomizeRender: true,
  render(instance: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return <img style={style} src={instance.data.src as string} />
  },
  renderMenu() {
    return <div>Image</div>
  },
  version: '0.0.1',
}

const Input: Brick = {
  name: 'Input',
  dataTypes: {
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onChange'],
  render(instance: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return <input style={style} onChange={instance.handlers['onChange']} />
  },
  renderMenu() {
    return <div>Input</div>
  },
  version: '0.0.1',
}

const TextWithAction: Brick = {
  name: 'TextWithAction',
  dataTypes: {
    content: 'string',
    style: 'object',
    styleOverride: 'object',
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
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return (
      <span style={style} data-testid="element-with-action" onClick={instance.handlers['onClick']}>
        {instance.data.content as string}
      </span>
    )
  },
  renderMenu() {
    return <div>TextWithAction</div>
  },
  version: '0.0.1',
}

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

ReactDOM.render(<Engine blueprint={blueprint} />, document.body)
