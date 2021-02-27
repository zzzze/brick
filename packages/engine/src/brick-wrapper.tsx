import React, { Children, cloneElement, useRef, useCallback, useContext, useMemo } from 'react'
import { ChildrenType, Config, DataObject, EngineMode, SetConfig } from './types'
import PropsConfigForm from './props-config-form'
import { BrickContainerProps } from '@brick/components'
import CommonConfigForm from './common-config-form'
import Context from './context'
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import clx from 'classnames'

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

const isHoverOnItselfOrChild = (config: Config, key: string): boolean => {
  if (config._key === key) {
    return true
  }
  if (Array.isArray(config.children)) {
    return config.children.some((child) => isHoverOnItselfOrChild(child, key))
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
  const context = useContext(Context)
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
  const configForm = context.renderConfigForm(
    <CommonConfigForm config={props.config} onConfigChange={props.onConfigChange}>
      <PropsConfigForm config={props.config} onPropsChange={handleChange} />
    </CommonConfigForm>,
    context.ee
  )
  const [{ isDragging }, drag] = useDrag(
    {
      item: {
        type: 'ItemTypes.BOX',
        config: props.config,
        lastAction: '',
        onRemove: props.onRemoveItemFormParent,
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
      accept: 'ItemTypes.BOX',
      canDrop(item: IDragItem, monitor: DropTargetMonitor) {
        if (!brickContainer.current) {
          return false
        }
        if (!monitor.isOver({ shallow: true })) {
          return false
        }
        if (isHoverOnItselfOrChild(item.config, props.config._key)) {
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
        const inForwardActionTriggerAera = isInForwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
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
      },
      hover(item: IDragItem, monitor: DropTargetMonitor) {
        if (!brickContainer.current) {
          return
        }
        if (!monitor.canDrop()) {
          return
        }
        const hoverBoundingRect = brickContainer.current.getBoundingClientRect()
        const clientOffset = monitor.getClientOffset()
        const inAdditionActionTriggerAera = isInAdditionActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inAdditionActionTriggerAera && item.lastAction !== `addition-${props.config._key}-${item.config._key}`) {
          props.onDrop && props.onDrop(item.config)
          item.onRemove && item.onRemove(item.config._key)
          item.onRemove = props.onRemoveChild
          item.lastAction = `addition-${props.config._key}-${item.config._key}`
        }
        const inForwardActionTriggerAera = isInForwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inForwardActionTriggerAera && item.lastAction !== `forward-${props.config._key}-${item.config._key}`) {
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.config, props.config._key, 'forward')
          props.onRemoveChild && props.onRemoveChild(item.config._key)
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `forward-${props.config._key}-${item.config._key}`
        }
        const inBackwardActionTriggerAera = isInBackwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (inBackwardActionTriggerAera && item.lastAction !== `backward-${props.config._key}-${item.config._key}`) {
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.config, props.config._key, 'backward')
          props.onRemoveChild && props.onRemoveChild(item.config._key)
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `backward-${props.config._key}-${item.config._key}`
        }
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    },
    [props]
  )
  drag(drop(brickContainer))
  return cloneElement<BrickContainerPropsWithRef>(
    child,
    {
      ref: brickContainer,
      configForm: context.mode === EngineMode.EDIT ? configForm : null,
      className: clx(child.props.className, 'brick', {
        'brick__with-config-form': context.mode === EngineMode.EDIT,
        'brick__with-config-form--dragging': isDragging,
        'brick__with-config-form--hovered': isOverCurrent,
      }),
    },
    ...Children.toArray(child.props.children),
    ...context.mode === EngineMode.EDIT ? [
      <div key="left" className="brick__action-area brick__action-area-left" />,
      <div key="right" className="brick__action-area brick__action-area-right" />,
      <div key="top" className="brick__action-area brick__action-area-top" />,
      <div key="bottom" className="brick__action-area brick__action-area-bottom" />
    ] : [],
  )
}
export default BrickWrapper
