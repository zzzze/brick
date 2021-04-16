import React, { Children, cloneElement, useRef, useCallback, useContext, useMemo, useState, RefObject } from 'react'
import { ChildrenType, Blueprint, DataObject, SetBlueprint } from './types'
import ConfigurationForm from './configuration-form'
import EnginxContext from './context'
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import clx from 'classnames'
import debounce from 'lodash/debounce'

export const ITEM_TYPE = 'brick-instance'

interface DragOverProps {
  className?: string
}

function isTypeString(obj: unknown): obj is string {
  return typeof obj === 'string'
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object'
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

export const createRemoveItemFromParentFn = (setBlueprint: SetBlueprint) => (key: string): void => {
  setBlueprint((blueprint) => {
    if (!blueprint.children || !blueprint.children.length) {
      return blueprint
    }
    const children = blueprint.children.filter((item) => item._key !== key)
    return {
      ...blueprint,
      children,
    }
  })
}

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
  blueprint: Blueprint
  parentBlueprint?: Blueprint
  onBlueprintChange: SetBlueprint
  style?: React.CSSProperties
  onRemoveItemFormParent?: (key: string) => void
  onAddToOrMoveInParent?: (blueprint: Blueprint, anchorKey: string, action: string) => void
  isRoot?: boolean
}

export interface IDragItem {
  type: string
  blueprint: Blueprint
  lastAction: string
  onRemove?: (key: string) => void
}

interface IBrickContainer extends React.PropsWithChildren<React.HTMLAttributes<HTMLElement>> {
  ref?: React.RefObject<HTMLElement>
}

const isHoverOnDragItemOrItsChild = (blueprint: Blueprint, key: string): boolean => {
  if (blueprint._key === key) {
    return true
  }
  if (Array.isArray(blueprint.children)) {
    return blueprint.children.some((child) => isHoverOnDragItemOrItsChild(child, key))
  }
  return false
}

const offset = 12

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
  if (context.previewMode) {
    return props.children
  }
  const brick = useMemo(() => {
    const brick = context.bricks[props.blueprint.name]
    if (!brick) {
      throw Error(`brick (${props.blueprint.name}) not found`)
    }
    return brick
  }, [context.bricks, props.blueprint])
  const parentBrick = useMemo(() => {
    if (!props.parentBlueprint) {
      return null
    }
    const brick = context.bricks[props.parentBlueprint.name]
    if (!brick) {
      throw Error(`brick (${props.parentBlueprint.name}) not found`)
    }
    return brick
  }, [context.bricks, props.parentBlueprint])
  const brickContainer = useRef<HTMLElement>(null)
  const handleChange = useCallback((newProps: DataObject) => {
    props.onBlueprintChange((blueprint: Blueprint) => {
      return {
        ...blueprint,
        data: newProps,
      }
    })
  }, [])
  const child: React.ReactElement<IBrickContainer> = Children.only(props.children)
  const canDrop = (item: IDragItem, monitor: DropTargetMonitor) => {
    if (!brickContainer.current) {
      return false
    }
    if (!monitor.isOver({ shallow: true })) {
      return false
    }
    if (isHoverOnDragItemOrItsChild(item.blueprint, props.blueprint._key)) {
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
      if (
        Array.isArray(props.blueprint.children) &&
        props.blueprint.children.some((c) => c._key === item.blueprint._key)
      ) {
        // item is in the container already
        return false
      }
      if (brick.childrenType === ChildrenType.NONE) {
        return false
      }
      if (
        brick.childrenType === ChildrenType.SINGLE &&
        Array.isArray(props.blueprint.children) &&
        props.blueprint.children.length > 0
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
        props?.parentBlueprint &&
        Array.isArray(props?.parentBlueprint?.children) &&
        props?.parentBlueprint.children.length > 0
      ) {
        return false
      }
    }
    return true
  }
  const handleRemoveFromParent = useCallback(
    (key: string) => {
      createRemoveItemFromParentFn(props.onBlueprintChange)(key)
    },
    [props.onBlueprintChange]
  )
  const handleAddChild = useCallback(
    (_blueprint: Blueprint) => {
      props.onBlueprintChange((blueprint) => {
        let children: Blueprint[] = []
        if (blueprint.children && blueprint.children.length) {
          children = blueprint.children.slice()
        }
        children.push({
          ..._blueprint,
        })
        return {
          ...blueprint,
          children,
        }
      })
    },
    [props.onBlueprintChange]
  )
  const [{ isDragging }, drag, preview] = useDrag(
    {
      item: {
        type: ITEM_TYPE,
        blueprint: props.blueprint,
        lastAction: '',
        onRemove: props.onRemoveItemFormParent,
      },
      canDrag() {
        return true
      },
      isDragging: (monitor: DragSourceMonitor) => {
        return (monitor.getItem() as IDragItem).blueprint._key === props.blueprint._key
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
        if (
          inAdditionActionTriggerAera &&
          item.lastAction !== `addition-${props.blueprint._key}-${item.blueprint._key}`
        ) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.blueprint._key)
          handleAddChild(item.blueprint)
          context.transactionCommit()
          item.onRemove = handleRemoveFromParent
          item.lastAction = `addition-${props.blueprint._key}-${item.blueprint._key}`
        }
        if (props.isRoot) {
          return
        }
        const inForwardActionTriggerAera = isInForwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (
          inForwardActionTriggerAera &&
          item.lastAction !== `forward-${props.blueprint._key}-${item.blueprint._key}`
        ) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'forward')
          context.transactionCommit()
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `forward-${props.blueprint._key}-${item.blueprint._key}`
        }
        const inBackwardActionTriggerAera = isInBackwardActionTriggerAera(
          hoverBoundingRect,
          clientOffset || { x: -1, y: -1 }
        )
        if (
          inBackwardActionTriggerAera &&
          item.lastAction !== `backward-${props.blueprint._key}-${item.blueprint._key}`
        ) {
          context.transactionBegin()
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'backward')
          context.transactionCommit()
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `backward-${props.blueprint._key}-${item.blueprint._key}`
        }
      }, 20),
      collect: (monitor: DropTargetMonitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    },
    [props]
  )
  const onRemove = useCallback(() => {
    props.onRemoveItemFormParent && props.onRemoveItemFormParent(props.blueprint._key)
    context.transactionCommit()
  }, [props.onRemoveItemFormParent])
  const isVoidElement = useMemo(() => isTypeString(child.type) && voidElements.includes(child.type), [child.type])
  const configurationForm = context.renderConfigurationForm(
    <ConfigurationForm
      blueprint={props.blueprint}
      onBlueprintChange={props.onBlueprintChange}
      onDataChange={handleChange}
      autoCommit={context.autoCommit}
      isVoidElement={isVoidElement}
    />,
    {
      ee: context.ee,
      connectDragSource: drag,
      removeItem: onRemove,
      blueprint: props.blueprint,
    }
  )
  preview(drop(brickContainer))
  const className = useMemo(() => {
    return clx('brick', 'brick__with-config-form', {
      'brick__with-config-form--dragging': isDragging,
      'brick__with-config-form--hovered': isOverCurrent && !isDragging,
    })
  }, [child.props.className, isDragging, isOverCurrent, isDragging])
  const actionArea = useMemo(() => {
    return !props.isRoot
      ? [
          <DragOver key="left" className="brick__action-area brick__action-area-left" />,
          <DragOver key="right" className="brick__action-area brick__action-area-right" />,
          <DragOver key="top" className="brick__action-area brick__action-area-top" />,
          <DragOver key="bottom" className="brick__action-area brick__action-area-bottom" />,
        ]
      : []
  }, [props.isRoot])
  const style = useMemo(() => {
    let style: Record<string, unknown> = {}
    let styleOverride: Record<string, unknown> = {}
    if (props.blueprint.data && isObject(props.blueprint.data.style)) {
      style = props.blueprint.data.style
    } else {
      style = {}
    }
    if (props.blueprint.data && isObject(props.blueprint.data.styleOverride)) {
      styleOverride = props.blueprint.data.styleOverride
    } else {
      styleOverride = {}
    }
    return {
      ...style,
      ...styleOverride,
    }
  }, [props.blueprint.data?.style, props.blueprint.data?.styleOverride])
  if (isTypeString(child.type) && isVoidElement) {
    let Tag: 'span' | 'div' = 'span'
    if (blockLevelElement.includes(child.type)) {
      Tag = 'div'
    }
    return (
      <Tag
        ref={brickContainer as RefObject<HTMLDivElement>}
        style={(props.blueprint.data?.wrapperStyle as React.CSSProperties) ?? {}}
        className={className}>
        {cloneElement<IBrickContainer>(child, {
          style,
        })}
        {configurationForm}
        {actionArea}
      </Tag>
    )
  }
  return cloneElement<IBrickContainer>(
    child,
    {
      ref: brickContainer,
      className: clx(child.props.className, className),
      style,
    },
    configurationForm,
    ...Children.toArray(child.props.children),
    ...actionArea
  )
}

export default BrickWrapper
