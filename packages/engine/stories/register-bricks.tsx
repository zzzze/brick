import React, { useMemo } from 'react'
import { Engine } from '../src/engine'
import { Brick, ChildrenType, BrickInstance, BrickStyle } from '../src/types'
import { StringType, NumberType, BooleanType, ObjectType, CodeType } from '../src/data/data-type'
import { Editor } from '@brick/components'

const View: Brick = {
  name: 'View',
  dataTypes: {
    dataSource: {
      type: 'object',
      default: {},
      canUseExpression: true,
    },
    name: 'string',
    style: 'object',
    styleOverride: 'object',
    if: {
      type: 'boolean',
      default: true,
      canUseExpression: true,
    },
    for: {
      type: 'string',
      default: '',
      canUseExpression: true,
    },
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
  style: BrickStyle.INLINE,
  dataTypes: {
    content: 'string',
    style: 'object',
    styleOverride: 'object',
    for: {
      type: 'string',
      default: '',
      canUseExpression: true,
    },
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
  style: BrickStyle.INLINE,
  dataTypes: {
    src: 'string',
    style: 'object',
    styleOverride: 'object',
    if: {
      type: 'boolean',
      default: true,
      canUseExpression: true,
    },
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
  style: BrickStyle.INLINE,
  dataTypes: {
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onChange', 'onKeyPress'],
  render(instance: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(instance.data.style as React.CSSProperties),
        ...(instance.editing ? (instance.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [instance])
    return <input style={style} onChange={instance.handlers['onChange']} onKeyPress={instance.handlers['onKeyPress']} />
  },
  renderMenu() {
    return <div>Input</div>
  },
  version: '0.0.1',
}

const TextWithAction: Brick = {
  name: 'TextWithAction',
  style: BrickStyle.INLINE,
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
