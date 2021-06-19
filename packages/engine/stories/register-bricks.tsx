import React, { useMemo } from 'react'
import { Engine } from '../src/engine'
import { Brick, ChildrenType, BrickInstance, BrickStyle } from '../src/types'
import { StringType, NumberType, BooleanType, ObjectType, CodeType, ColorType } from '../src/data/data-type'
import { Editor } from '@brick/components'

const View: Brick = {
  name: 'View',
  dataTypes: {
    others: {
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
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return <div style={style}>{this.children}</div>
  },
  renderMenu() {
    return <div>View</div>
  },
  configurationForms: ['id', 'actions', 'handlers', 'supply.data', 'supply.actions', 'render', 'data.wrapperStyle'],
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
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return <span style={style}>{this.data.content as string}</span>
  },
  renderMenu() {
    return <div>Text</div>
  },
  configurationForms: ['render'],
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
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return <img style={style} src={this.data.src as string} />
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
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return <input style={style} onChange={this.handlers['onChange']} onKeyPress={this.handlers['onKeyPress']} />
  },
  renderMenu() {
    return <div>Input</div>
  },
  version: '0.0.1',
}

const Button: Brick = {
  name: 'Button',
  style: BrickStyle.INLINE,
  dataTypes: {
    style: 'object',
    styleOverride: 'object',
  },
  childrenType: ChildrenType.NONE,
  eventNames: ['onClick'],
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return (
      <button style={style} onClick={() => console.log('xxxxx')}>
        button
      </button>
    )
  },
  renderMenu() {
    return <div>Button</div>
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
    onClick: `function () {
      this.setData(function(data) {
        return Object.assign({}, data, {
          content: 'foo',
        })
      })
    }`,
  },
  render(this: BrickInstance) {
    const style = useMemo(() => {
      return {
        ...(this.data.style as React.CSSProperties),
        ...(this.editing ? (this.data.styleOverride as React.CSSProperties) : {}),
      }
    }, [this.data, this.editing])
    return (
      <span style={style} data-testid="element-with-action" onClick={this.handlers['onClick']}>
        {this.data.content as string}
      </span>
    )
  },
  renderMenu() {
    return <div>TextWithAction</div>
  },
  version: '0.0.1',
}

const TitleBlock: Brick = {
  name: 'TitleBlock',
  style: BrickStyle.BLOCK,
  dataTypes: {
    title: {
      type: 'string',
      label: '标题',
      default: '今年最佳毕设',
    },
    tags: {
      type: 'string',
      label: '标签（空格分隔）',
      default: '最实验 最未来 最有爱 最跨界',
    },
    color: {
      type: 'color',
      label: '颜色',
      default: '#00fff0',
    },
    code: {
      type: 'number',
      label: '号码',
      default: 10,
    },
  },
  childrenType: ChildrenType.NONE,
  render(this: BrickInstance) {
    return (
      <section style={{ fontFamily: 'sans-serif', padding: '20px 56px 20px 16px' }}>
        <section style={{ height: '0px', transform: 'translate(36px, 16px)' }}>
          <section
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: this.data.color as string,
              borderRadius: '100%',
              marginLeft: 'auto',
            }}
          />
        </section>
        <p
          style={{
            fontSize: '38px',
            fontWeight: 'bold',
            margin: '0px 0px 5px',
            borderTop: '1.5px solid black',
            borderBottom: '1.5px solid black',
            transform: 'translateY(0px)',
          }}>
          {this.data.title as string}
        </p>
        <section style={{ display: 'flex', lineHeight: '20px', transform: 'translateY(0px)' }}>
          <section style={{ fontSize: '10px', flexGrow: 1 }}>
            {(this.data.tags as string).split(' ').map((tag) => (
              <>
                <p style={{ display: 'inline-block', margin: '0px', color: this.data.color as string }}>⬤</p>
                <p style={{ display: 'inline-block', margin: '0px', color: 'black', padding: '0px 4px' }}>{tag}</p>
              </>
            ))}
          </section>
          <input type="text" />
          <button onClick={() => console.log('yyyyy')}>xxxx</button>
          <div onClick={() => console.log('yyyyy')}>div</div>
          <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0px', fontFamily: 'Arial' }}>
            vol.{this.data.code as number}
          </p>
        </section>
      </section>
    )
  },
  renderMenu() {
    return <div>TitleBlock</div>
  },
  version: '0.0.1',
}

export default (): void => {
  Engine.registerBrick(View)
  Engine.registerBrick(Text)
  Engine.registerBrick(Image)
  Engine.registerBrick(Input)
  Engine.registerBrick(Button)
  Engine.registerBrick(TextWithAction)

  Engine.registerBrick(TitleBlock)

  Engine.registerDataType(StringType)
  Engine.registerDataType(NumberType)
  Engine.registerDataType(BooleanType)
  Engine.registerDataType(ObjectType)
  Engine.registerDataType(CodeType)
  Engine.registerDataType(ColorType)

  Engine.registerFormItem('code', () => <Editor style={{ width: '100%', height: 200 }} />)
}
