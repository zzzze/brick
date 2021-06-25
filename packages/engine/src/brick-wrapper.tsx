import React, { Children, cloneElement, useRef, useCallback, useContext, useMemo, useEffect, MouseEvent } from 'react'
import { ChildrenType, Blueprint, DataObject, SetBlueprint, BrickStyle } from './types'
import ConfigurationForm from './configuration-form'
import EnginxContext from './context'
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { createUseStyles, useTheme } from 'react-jss'
import clx from 'classnames'
import debounce from 'lodash/debounce'
import { theme } from '@brick/shared'
import { CopyWrapper } from './render-copy'
let prevSelectedID: string | null = null

const setPrevSelectID = (id: string | null) => {
  prevSelectedID = id
}

enum ActionArea {
  TOP = 'top',
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  CENTER = 'center',
}

export const ITEM_TYPE = 'brick-instance'
const CONTAINER_IDENTIFIER_KEY = 'data-identifier'
const CONTAINER_IDENTIFIER_VALUE = 'brick-container'

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      brick: {
        padding: '3px',
      },
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
      brickSelected: {
        outline: `dashed 1px ${theme.palette.primary.main}`,
      },
      brickHovered: {
        backgroundColor: '#efefef',
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme.palette.grey[500]}`,
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
    }
  },
  { name: 'BrickWrapper' }
)

function isTypeString(obj: unknown): obj is string {
  return typeof obj === 'string'
}

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
  [CONTAINER_IDENTIFIER_KEY]?: string
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

const offset = 5
const delay = 10

const BrickWrapper: React.FC<BrickWrapperProps> = (props: BrickWrapperProps) => {
  const context = useContext(EnginxContext)
  const hoveredAreaRef = useRef<ActionArea | null>(null)
  const classes = useStyles()
  const brick = useMemo(() => {
    const brick = context.bricks[props.blueprint.name]
    if (!brick) {
      throw Error(`brick (${props.blueprint.name}) not found`)
    }
    return brick
  }, [context.bricks, props.blueprint])
  const brickContainer = useRef<HTMLElement>(null)
  const handleChange = useCallback((newProps: DataObject) => {
    props.onBlueprintChange((blueprint: Blueprint) => {
      return {
        ...blueprint,
        data: newProps,
      }
    })
  }, [])
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
  const canDrop = useCallback(
    (item: IDragItem, monitor: DropTargetMonitor) => {
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
      return true
    },
    [brickContainer.current, props.blueprint]
  )
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
      begin: () => {
        setPrevSelectID(null)
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
  useEffect(() => {
    if (brickContainer.current) {
      drag(brickContainer.current)
    }
  }, [drag, brickContainer.current])
  const [{ isOverCurrent }, drop] = useDrop(
    {
      accept: ITEM_TYPE,
      drop: (item: IDragItem, monitor: DropTargetMonitor) => {
        if (context.moveOnHover) {
          return
        }
        if (!canDrop(item, monitor)) {
          return
        }
        context.transactionBegin()
        if (hoveredAreaRef.current && [ActionArea.TOP, ActionArea.LEFT].includes(hoveredAreaRef.current)) {
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'forward')
        } else if (hoveredAreaRef.current && [ActionArea.RIGHT, ActionArea.BOTTOM].includes(hoveredAreaRef.current)) {
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'backward')
        } else if (hoveredAreaRef.current === ActionArea.CENTER) {
          item.onRemove && item.onRemove(item.blueprint._key)
          handleAddChild(item.blueprint)
        }
        context.transactionCommit()
      },

      hover: debounce((item: IDragItem, monitor: DropTargetMonitor) => {
        /**
         * Must remove item before insert it, otherwise item can't insert to container due to same key item exists.
         * And then the item will lost.
         */
        if (!context.moveOnHover) {
          return
        }
        if (!brickContainer.current) {
          return
        }
        if (!canDrop(item, monitor)) {
          return
        }
        if (!hoveredAreaRef.current) {
          return
        }
        if (hoveredAreaRef.current && [ActionArea.TOP, ActionArea.LEFT].includes(hoveredAreaRef.current)) {
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'forward')
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `forward-${props.blueprint._key}-${item.blueprint._key}`
        } else if (hoveredAreaRef.current && [ActionArea.RIGHT, ActionArea.BOTTOM].includes(hoveredAreaRef.current)) {
          item.onRemove && item.onRemove(item.blueprint._key)
          props.onAddToOrMoveInParent && props.onAddToOrMoveInParent(item.blueprint, props.blueprint._key, 'backward')
          item.onRemove = props.onRemoveItemFormParent
          item.lastAction = `backward-${props.blueprint._key}-${item.blueprint._key}`
        } else if (hoveredAreaRef.current === ActionArea.CENTER) {
          item.onRemove && item.onRemove(item.blueprint._key)
          handleAddChild(item.blueprint)
          item.onRemove = handleRemoveFromParent
          item.lastAction = `addition-${props.blueprint._key}-${item.blueprint._key}`
        }
        context.transactionCommit()
      }, delay),
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
      prevSelectedID,
      setPrevSelectID,
      classes: {
        container: classes.brickConfigForm,
        btnGroup: classes.brickConfigFormBtnGroup,
      },
    }
  )
  preview(drop(brickContainer))
  const isSelected = useMemo(() => props.blueprint._key == context.selectedInstance, [
    props.blueprint._key,
    context.selectedInstance,
  ])
  useEffect(() => {
    if (!brickContainer.current) {
      return
    }
    brickContainer.current.querySelectorAll('input').forEach((item) => {
      item.readOnly = true
    })
    return () => {
      if (!brickContainer.current) {
        return
      }
      brickContainer.current.querySelectorAll('input').forEach((item) => {
        item.readOnly = false
      })
    }
  }, [])
  const _theme: theme.Theme = useTheme()
  const moveVertical = useMemo(
    () =>
      !context.moveOnHover ||
      (context.moveOnHover && (typeof context.moveOnHover === 'boolean' || context.moveOnHover.vertical)),
    [context.moveOnHover]
  )
  const moveHorizontal = useMemo(
    () =>
      !context.moveOnHover ||
      (context.moveOnHover && (typeof context.moveOnHover === 'boolean' || context.moveOnHover.horizontal)),
    [context.moveOnHover]
  )
  const handleMouseMove = useCallback(
    debounce((event: globalThis.MouseEvent) => {
      if (!brickContainer.current || isDragging || (!isDragging && !isOverCurrent)) {
        return
      }
      const hoverBoundingRect = brickContainer.current.getBoundingClientRect()
      const isTop =
        moveVertical &&
        event.x > hoverBoundingRect.x &&
        event.x < hoverBoundingRect.x + hoverBoundingRect.width &&
        event.y > hoverBoundingRect.y &&
        event.y < hoverBoundingRect.y + offset
      const isLeft =
        moveHorizontal &&
        event.y > hoverBoundingRect.y &&
        event.y < hoverBoundingRect.y + hoverBoundingRect.height &&
        event.x > hoverBoundingRect.x &&
        event.x < hoverBoundingRect.x + offset
      const isRight =
        moveHorizontal &&
        event.y > hoverBoundingRect.y &&
        event.y < hoverBoundingRect.y + hoverBoundingRect.height &&
        event.x > hoverBoundingRect.x + hoverBoundingRect.width - offset &&
        event.x < hoverBoundingRect.x + hoverBoundingRect.width
      const isBottom =
        moveVertical &&
        event.x > hoverBoundingRect.x &&
        event.x < hoverBoundingRect.x + hoverBoundingRect.width &&
        event.y > hoverBoundingRect.y + hoverBoundingRect.height - offset &&
        event.y < hoverBoundingRect.y + hoverBoundingRect.height
      if (isTop && !props.isRoot) {
        if (
          parentBrick?.childrenType === ChildrenType.SINGLE &&
          props?.parentBlueprint &&
          Array.isArray(props?.parentBlueprint?.children) &&
          props?.parentBlueprint.children.length > 0
        ) {
          brickContainer.current.style.boxShadow = `0px -2px 0px 0px ${_theme.palette.grey[500]}`
        } else {
          brickContainer.current.style.boxShadow = `0px -2px 0px 0px ${_theme.palette.primary.dark}`
          hoveredAreaRef.current = ActionArea.TOP
        }
      } else if (isLeft && !props.isRoot) {
        if (
          parentBrick?.childrenType === ChildrenType.SINGLE &&
          props?.parentBlueprint &&
          Array.isArray(props?.parentBlueprint?.children) &&
          props?.parentBlueprint.children.length > 0
        ) {
          brickContainer.current.style.boxShadow = `-2px 0px 0px 0px ${_theme.palette.grey[500]}`
        } else {
          brickContainer.current.style.boxShadow = `-2px 0px 0px 0px ${_theme.palette.primary.dark}`
          hoveredAreaRef.current = ActionArea.LEFT
        }
      } else if (isRight && !props.isRoot) {
        if (
          parentBrick?.childrenType === ChildrenType.SINGLE &&
          props?.parentBlueprint &&
          Array.isArray(props?.parentBlueprint?.children) &&
          props?.parentBlueprint.children.length > 0
        ) {
          brickContainer.current.style.boxShadow = `-2px 0px 0px 0px ${_theme.palette.grey[500]}`
        } else {
          brickContainer.current.style.boxShadow = `2px 0px 0px 0px ${_theme.palette.primary.dark}`
          hoveredAreaRef.current = ActionArea.RIGHT
        }
      } else if (isBottom && !props.isRoot) {
        if (
          parentBrick?.childrenType === ChildrenType.SINGLE &&
          props?.parentBlueprint &&
          Array.isArray(props?.parentBlueprint?.children) &&
          props?.parentBlueprint.children.length > 0
        ) {
          brickContainer.current.style.boxShadow = `-2px 0px 0px 0px ${_theme.palette.grey[500]}`
        } else {
          brickContainer.current.style.boxShadow = `0px 2px 0px 0px ${_theme.palette.primary.dark}`
          hoveredAreaRef.current = ActionArea.BOTTOM
        }
      } else {
        if (
          Array.isArray(props.blueprint.children) &&
          props.blueprint.children.some((c) => c._key === props.blueprint._key)
        ) {
          // item is in the container already
          hoveredAreaRef.current = null
          brickContainer.current.style.boxShadow = `0px 0px 0px 2px ${_theme.palette.grey[500]}`
        } else if (brick.childrenType === ChildrenType.NONE) {
          hoveredAreaRef.current = null
          brickContainer.current.style.boxShadow = `0px 0px 0px 2px ${_theme.palette.grey[500]}`
        } else if (
          brick.childrenType === ChildrenType.SINGLE &&
          Array.isArray(props.blueprint.children) &&
          props.blueprint.children.length > 0
        ) {
          hoveredAreaRef.current = null
          brickContainer.current.style.boxShadow = `0px 0px 0px 2px ${_theme.palette.grey[500]}`
        } else {
          hoveredAreaRef.current = ActionArea.CENTER
          brickContainer.current.style.boxShadow = `0px 0px 0px 2px ${_theme.palette.primary.dark}`
        }
      }
    }, delay),
    [isDragging, isOverCurrent, props?.parentBlueprint, props.isRoot, parentBrick, moveVertical, moveHorizontal]
  )
  useEffect(() => {
    if (!isOverCurrent) {
      handleMouseLeave()
    }
  }, [isOverCurrent])
  const handleMouseLeave = useCallback(
    debounce(() => {
      if (!brickContainer.current) {
        return
      }
      brickContainer.current.style.boxShadow = 'none'
      hoveredAreaRef.current = null
    }, delay),
    []
  )
  useEffect(() => {
    if (!brickContainer.current) {
      return
    }
    brickContainer.current.addEventListener('dragover', handleMouseMove)
    brickContainer.current.addEventListener('dragleave', handleMouseLeave)
    brickContainer.current.addEventListener('drop', handleMouseLeave)
    window.addEventListener('click', handleMouseLeave)
    return () => {
      if (!brickContainer.current) {
        return
      }
      brickContainer.current.removeEventListener('dragover', handleMouseMove)
      brickContainer.current.removeEventListener('dragleave', handleMouseLeave)
      brickContainer.current.removeEventListener('drop', handleMouseLeave)
      window.removeEventListener('click', handleMouseLeave)
    }
  }, [handleMouseMove])
  const className = useMemo(() => {
    return clx(classes.brick, 'brick', {
      [classes.brickSelected]: isSelected,
      [classes.brickDragging]: isDragging,
      [classes.brickHovered]: isOverCurrent && !isDragging,
      [classes.brickHidden]: props.hidden,
    })
  }, [child.props.className, isDragging, isOverCurrent, isDragging, props.hidden, isSelected])
  const onSelect = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      let node: HTMLElement | null = event.target as HTMLElement
      if (event.currentTarget !== node) {
        while (node && node.dataset[CONTAINER_IDENTIFIER_KEY.replace('data-', '')] !== CONTAINER_IDENTIFIER_VALUE) {
          node = node.parentElement
        }
        if (node !== event.currentTarget) {
          return
        }
      }
      context.selectInstance(props.blueprint._key)
      event.preventDefault()
      event.stopPropagation()
    },
    [context.selectInstance]
  )
  const newProps = useMemo(() => {
    return {
      ref: brickContainer,
      [CONTAINER_IDENTIFIER_KEY]: CONTAINER_IDENTIFIER_VALUE,
      onClickCapture: onSelect,
      className: clx(child.props.className, className),
      readOnly: typeof child.type === 'string' && ['input'].includes(child.type),
    }
  }, [child.type, child.props.className, className, onSelect])
  if (context.previewMode) {
    return props.children
  }
  return (
    <>
      {configurationForm}
      {cloneElement<IBrickContainer>(
        child,
        newProps,
        ...(isTypeString(child.type) && isVoidElement ? Children.toArray(child.props.children) : [])
      )}
    </>
  )
}

export default BrickWrapper
