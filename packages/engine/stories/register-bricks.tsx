import React, { useMemo } from 'react'
import { Engine } from '../src'
import { Brick, ChildrenType, BrickInstance } from '../src/types'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '../src/data/data-type'
import { Editor } from '@brick/components'

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
  Engine.registerDataType(ObjectType)
  Engine.registerDataType(CodeType)

  Engine.registerFormItem('code', () => <Editor style={{ width: '100%', height: 200 }} />)
}
