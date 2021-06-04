import React, { Children, cloneElement, useRef, useCallback, useContext, useMemo, useState, RefObject } from 'react'
import { ChildrenType, Blueprint, DataObject, SetBlueprint, BrickStyle } from './types'
import ConfigurationForm from './configuration-form'
import EnginxContext from './context'
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import { createUseStyles } from 'react-jss'
import clx from 'classnames'
import debounce from 'lodash/debounce'
import { theme } from '@brick/shared'
import { CopyWrapper } from './render-copy'

export const ITEM_TYPE = 'brick-instance'

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      brickWithConfigForm: {
        position: 'relative',
        padding: '20px',
        margin: '10px',
        minWidth: '100px',
        minHeight: '20px',
        verticalAlign: 'middle',
        border: `solid 1px ${theme.palette.grey[400]}`,
        borderRadius: '5px',
        'span&': {
          display: 'inline-block',
        },
        'div&': {
          marginTop: '20px',
        },
      },
      brickDragging: {
        border: `solid 1px ${theme.palette.grey[400]}`,
        background: '#fff8d1',
        color: '#fff8d1',
        '& *': {
          opacity: 0,
        },
      },
      brickHovered: {
        backgroundColor: '#efefef',
      },
      brickHidden: {
        opacity: 0.5,
      },
      brickConfigFormActive: {},
      brickConfigForm: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 100,
        fontSize: '16px',
        maxHeight: '80vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: '#333',
      },
      brickConfigFormBtnGroup: {
        display: 'none',
        padding: '5px 8px',
        color: '#fff',
        borderRadius: '0 4px',
        background: theme.palette.mask.main,
        '$brickWithConfigForm:hover > $brickConfigForm &': {
          display: 'flex',
        },
      },
      actionArea: {
        position: 'absolute',
        '&::before': {
          content: '""',
          position: 'absolute',
          backgroundColor: '#ccc',
        },
        '&$actionAreaHovered::before': {
          backgroundColor: '#1da1ff',
        },
        '$brickWithConfigForm:not($brickHovered) > &': {
          display: 'none',
        },
      },
      actionAreaHovered: {},
      actionAreaTop: {
        top: 0,
        left: 0,
        right: 0,
        height: '10px',
        borderRadius: '2px',
        '&::before': {
          top: '8px',
          left: '50%',
          width: '20px',
          height: '2px',
          borderRadius: '2px',
          transform: 'translateX(-50%)',
        },
      },
      actionAreaBottom: {
        bottom: 0,
        left: 0,
        right: 0,
        height: '10px',
        borderRadius: '2px',
        '&::before': {
          bottom: '8px',
          left: '50%',
          width: '20px',
          height: '2px',
          borderRadius: '2px',
          transform: 'translateX(-50%)',
        },
      },
      actionAreaLeft: {
        left: 0,
        top: 0,
        bottom: 0,
        width: '10px',
        borderRadius: '2px',
        '&::before': {
          left: '8px',
          top: '50%',
          height: '20px',
          width: '2px',
          borderRadius: '2px',
          transform: 'translateY(-50%)',
        },
      },
      actionAreaRight: {
        right: 0,
        top: 0,
        bottom: 0,
        width: '10px',
        borderRadius: '2px',
        '&::before': {
          right: '8px',
          top: '50%',
          height: '20px',
          width: '2px',
          borderRadius: '2px',
          transform: 'translateY(-50%)',
        },
      },
    }
  },
  { name: 'BrickWrapper' }
)

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
  const classes = useStyles()
  const [hover, setHover] = useState(false)
  const handleMouseOver = useCallback(() => setHover(true), [])
  const handleMouseOut = useCallback(() => setHover(false), [])
  return (
    <div
      className={clx(className, {
        [classes.actionAreaHovered]: hover,
      })}
      onDragEnter={handleMouseOver}
      onDragLeave={handleMouseOut}
      onDrop={handleMouseOut}
    />
  )
}

interface BrickWrapperProps {
  hidden?: boolean
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
  const classes = useStyles()
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
  // const child: React.ReactElement<IBrickContainer> = Children.only(props.children)
  const child: React.ReactElement<IBrickContainer> = useMemo(() => {
    if (React.Children.count(props.children) <= 1) {
      if (props.children.type === CopyWrapper) {
        let Tag: 'span' | 'div' = 'div'
        if (brick.style === BrickStyle.INLINE) {
          Tag = 'span'
        }
        return <Tag>{props.children}</Tag>
      }
      return props.children as React.ReactElement<IBrickContainer>
    } else {
      const firstChild = React.Children.toArray(props.children)[0] as React.ReactElement<IBrickContainer>
      return cloneElement(firstChild, {}, props.children)
    }
  }, [props.children, brick])
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
    />,
    {
      connectDragSource: drag,
      removeItem: onRemove,
      blueprint: props.blueprint,
      classes: {
        container: classes.brickConfigForm,
        btnGroup: classes.brickConfigFormBtnGroup,
      },
    }
  )
  preview(drop(brickContainer))
  const className = useMemo(() => {
    return clx('brick', classes.brickWithConfigForm, {
      [classes.brickDragging]: isDragging,
      [classes.brickHovered]: isOverCurrent && !isDragging,
      [classes.brickHidden]: props.hidden,
    })
  }, [child.props.className, isDragging, isOverCurrent, isDragging, props.hidden])
  const actionArea = useMemo(() => {
    return !props.isRoot
      ? [
          <DragOver key="left" className={clx(classes.actionArea, classes.actionAreaLeft)} />,
          <DragOver key="right" className={clx(classes.actionArea, classes.actionAreaRight)} />,
          <DragOver key="top" className={clx(classes.actionArea, classes.actionAreaTop)} />,
          <DragOver key="bottom" className={clx(classes.actionArea, classes.actionAreaBottom)} />,
        ]
      : []
  }, [props.isRoot])
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
        {cloneElement<IBrickContainer>(child)}
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
    },
    configurationForm,
    ...Children.toArray(child.props.children),
    ...actionArea
  )
}

export default BrickWrapper
