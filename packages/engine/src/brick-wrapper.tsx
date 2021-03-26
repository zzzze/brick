import React, { Children, cloneElement, useRef, useCallback, useContext, useMemo, useState, RefObject } from 'react'
import { ChildrenType, Config, DataObject, EngineMode, SetConfig } from './types'
import { BrickContainerProps } from '@brick/components'
import ConfigurationForm from './configuration-form'
import EnginxContext from './context'
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import clx from 'classnames'
import debounce from 'lodash/debounce'

const ITEM_TYPE = 'brick-config'

interface DragOverProps {
  className?: string
}

function isTypeString(obj: unknown): obj is string {
  return typeof obj === 'string'
}

const blockLevelElement = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'dialog',
  'dd',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
]

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

const DragOver: React.FC<DragOverProps> = ({ className }: DragOverProps) => {
  const [hover, setHover] = useState(false)
  const handleMouseOver = useCallback(() => setHover(true), [])
  const handleMouseOut = useCallback(() => setHover(false), [])
  return (
    <div
      className={clx(className, {
        'brick__action-area--hovered': hover,
      })}
      onDragEnter={handleMouseOver}
      onDragLeave={handleMouseOut}
      onDrop={handleMouseOut}
    />
  )
}

interface BrickWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
  config: Config
  parentConfig?: Config
  onConfigChange: SetConfig
  style?: React.CSSProperties
  onRemoveItemFormParent?: (key: string) => void
  onRemoveChild?: (key: string) => void
  onAddToOrMoveInParent?: (config: Config, anchorKey: string, action: string) => void
  onDrop?: (config: Config) => void
  isRoot?: boolean
}

export interface IDragItem {
  type: string
  config: Config
  lastAction: string
  onRemove?: (key: string) => void
}

interface BrickContainerPropsWithRef extends React.PropsWithChildren<BrickContainerProps> {
  ref?: React.RefObject<HTMLElement>
}

const isHoverOnDragItemOrItsChild = (config: Config, key: string): boolean => {
  if (config._key === key) {
    return true
  }
  if (Array.isArray(config.children)) {
    return config.children.some((child) => isHoverOnDragItemOrItsChild(child, key))
  }
  return false
}

const offset = 10

// The area trigger insert item to the hovered element
const isInAdditionActionTriggerAera = (rect: DOMRect, clientOffset: XYCoord) => {
  return (
    clientOffset.x > rect.x + offset &&
    clientOffset.x < rect.x + rect.width - offset &&
    clientOffset.y > rect.y + offset &&
    clientOffset.y < rect.y + rect.height - offset
  )
}

// The area trigger move item in front of the hovered element
const isInForwardActionTriggerAera = (rect: DOMRect, clientOffset: XYCoord) => {
  return (
    (clientOffset.x > rect.x &&
      clientOffset.x < rect.x + rect.width &&
      clientOffset.y > rect.y &&
      clientOffset.y < rect.y + offset) || // top
    (clientOffset.y > rect.y &&
      clientOffset.y < rect.y + rect.height &&
      clientOffset.x > rect.x &&
      clientOffset.x < rect.x + offset) // left
  )
}

// The area trigger move item after the hovered element
const isInBackwardActionTriggerAera = (rect: DOMRect, clientOffset: XYCoord) => {
  return (
    (clientOffset.x > rect.x &&
      clientOffset.x < rect.x + rect.width &&
      clientOffset.y > rect.y + rect.height - offset &&
      clientOffset.y < rect.y + rect.height) || // bottom
    (clientOffset.y > rect.y &&
      clientOffset.y < rect.y + rect.height &&
      clientOffset.x > rect.x + rect.width - offset &&
      clientOffset.x < rect.x + rect.width) // right
  )
}

const BrickWrapper: React.FC<BrickWrapperProps> = (props: BrickWrapperProps) => {
  const context = useContext(EnginxContext)
  const brick = useMemo(() => {
    const brick = context.bricks[props.config.name]
    if (!brick) {
      throw Error(`brick (${props.config.name}) not found`)
    }
    return brick
  }, [context.bricks, props.config])
  const parentBrick = useMemo(() => {
    if (!props.parentConfig) {
      return null
    }
    const brick = context.bricks[props.parentConfig.name]
    if (!brick) {
      throw Error(`brick (${props.parentConfig.name}) not found`)
    }
    return brick
  }, [context.bricks, props.parentConfig])
  const brickContainer = useRef<HTMLElement>(null)
  const handleChange = useCallback((newProps: DataObject) => {
    props.onConfigChange((config: Config) => {
      return {
        ...config,
        data: newProps,
      }
    })
  }, [])
  const child: React.ReactElement<BrickContainerPropsWithRef> = Children.only(props.children)
  const canDrop = (item: IDragItem, monitor: DropTargetMonitor) => {
    if (context.mode !== EngineMode.EDIT) {
      return false
    }
    if (!brickContainer.current) {
      return false
    }
    if (!monitor.isOver({ shallow: true })) {
      return false
    }
    if (isHoverOnDragItemOrItsChild(item.config, props.config._key)) {
      // drag and hover on itself or its children
      return false
    }
    const hoverBoundingRect = brickContainer.current.getBoundingClientRect()
    const clientOffset = monitor.getClientOffset()
    const inAdditionActionTriggerAera = isInAdditionActionTriggerAera(
      hoverBoundingRect,
      clientOffset || { x: -1, y: -1 }
    )
    if (inAdditionActionTriggerAera) {
      if (Array.isArray(props.config.children) && props.config.children.some((c) => c._key === item.config._key)) {
        // item is in the container already
        return false
      }
      if (brick.childrenType === ChildrenType.NONE) {
        return false
      }
      if (
        brick.childrenType === ChildrenType.SINGLE &&
        Array.isArray(props.config.children) &&
        props.config.children.length > 0
      ) {
        return false
      }
    }
    const inForwardActionTriggerAera = isInForwardActionTriggerAera(hoverBoundingRect, clientOffset || { x: -1, y: -1 })
    const inBackwardActionTriggerAera = isInBackwardActionTriggerAera(
      hoverBoundingRect,
      clientOffset || { x: -1, y: -1 }
    )
    if (inForwardActionTriggerAera || inBackwardActionTriggerAera) {
      if (
        parentBrick?.childrenType === ChildrenType.SINGLE &&
        props?.parentConfig &&
        Array.isArray(props?.parentConfig?.children) &&
        props?.parentConfig.children.length > 0
      ) {
        return false
      }
    }
    return true
  }
  const [{ isDragging }, drag, preview] = useDrag(
    {
      item: {
        type: ITEM_TYPE,
        config: props.config,
        lastAction: '',
        onRemove: props.onRemoveItemFormParent,
      },
      canDrag() {
        return context.mode === EngineMode.EDIT
      },
      isDragging: (monitor: DragSourceMonitor) => {
        return (monitor.getItem() as IDragItem).config._key === props.config._key
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    },
    [props]
  )
  const [{ isOverCurrent }, drop] = useDrop(
    {
      accept: ITEM_TYPE,
      hover: debounce((item: IDragItem, monitor: DropTargetMonitor) => {
        /**
         * Must remove item before insert it, otherwise item can't insert to container due to same key item exists.
         * And then the item will lost.
         */
        if (!brickContainer.current) {
          return
        }
        if (!canDrop(item, monitor)) {
          return
        }
        const hoverBoundingRect = brickContainer.current.getBoundingClientRect()
        const clientOffset = monitor.getClientOffset()
        const inAdditionActionTriggerAera = isInAdditionActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inAdditionActionTriggerAera && item.lastAction !== `addition-${props.config._key}-${item.config._key}`) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.config._key)
          props.onDrop && props.onDrop(item.config)
          context.transactionCommit()
          item.onRemove = props.onRemoveChild
          item.lastAction = `addition-${props.config._key}-${item.config._key}`
        }
        if (props.isRoot) {
          return
        }
        const inForwardActionTriggerAera = isInForwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inForwardActionTriggerAera && item.lastAction !== `forward-${props.config._key}-${item.config._key}`) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.config._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.config, props.config._key, 'forward')
          context.transactionCommit()
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `forward-${props.config._key}-${item.config._key}`
        }
        const inBackwardActionTriggerAera = isInBackwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inBackwardActionTriggerAera && item.lastAction !== `backward-${props.config._key}-${item.config._key}`) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.config._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.config, props.config._key, 'backward')
          context.transactionCommit()
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `backward-${props.config._key}-${item.config._key}`
        }
      }, 20),
      collect: (monitor: DropTargetMonitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    },
    [props]
  )
  const onRemove = useCallback(() => {
    props.onRemoveItemFormParent && props.onRemoveItemFormParent(props.config._key)
    context.transactionCommit()
  }, [props.onRemoveItemFormParent])
  const configForm = context.renderConfigurationForm(
    <ConfigurationForm
      config={props.config}
      onConfigChange={props.onConfigChange}
      onDataChange={handleChange}
      autoCommit={context.autoCommit}
    />,
    {
      ee: context.ee,
      connectDragSource: drag,
      removeItem: onRemove,
    }
  )
  preview(drop(brickContainer))
  const configurationForm = useMemo(() => {
    return context.mode === EngineMode.EDIT ? configForm : null
  }, [context.mode, configForm])
  const className = useMemo(() => {
    return clx('brick', {
      'brick__with-config-form': context.mode === EngineMode.EDIT,
      'brick__with-config-form--dragging': isDragging,
      'brick__with-config-form--hovered': isOverCurrent && !isDragging,
    })
  }, [child.props.className, context.mode, isDragging, isOverCurrent, isDragging])
  const actionArea = useMemo(() => {
    return context.mode === EngineMode.EDIT && !props.isRoot
      ? [
          <DragOver key="left" className="brick__action-area brick__action-area-left" />,
          <DragOver key="right" className="brick__action-area brick__action-area-right" />,
          <DragOver key="top" className="brick__action-area brick__action-area-top" />,
          <DragOver key="bottom" className="brick__action-area brick__action-area-bottom" />,
        ]
      : []
  }, [context.mode, props.isRoot])
  if (isTypeString(child.type) && voidElements.includes(child.type)) {
    let Tag: 'span' | 'div' = 'span'
    if (blockLevelElement.includes(child.type)) {
      Tag = 'div'
    }
    return (
      <Tag ref={brickContainer as RefObject<HTMLDivElement>} className={className}>
        {child}
        {configurationForm}
        {actionArea}
      </Tag>
    )
  }
  return cloneElement<BrickContainerPropsWithRef>(
    child,
    {
      ref: brickContainer,
      className: clx(child.props.className, className),
    },
    configurationForm,
    ...Children.toArray(child.props.children),
    ...actionArea
  )
}
export default BrickWrapper
