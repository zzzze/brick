import React, { Children, cloneElement, useRef, useCallback, useContext, useState, useMemo } from 'react'
import { ChildrenType, Config, DataObject, EngineMode, SetConfig } from './types'
import PropsConfigForm from './props-config-form'
import { BrickContainerProps } from '@brick/components'
import CommonConfigForm from './common-config-form'
import Context from './context'
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
// import { XYCoord } from 'dnd-core'
import clx from 'classnames'

interface BrickWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
  config: Config
  onConfigChange: SetConfig
  style?: React.CSSProperties
  greedy?: boolean
  onRemoveItemFormParent?: (key: string) => void
  onRemoveChild?: (key: string) => void
  onDrop?: (config: Config) => void
}

export interface IDragItem {
  type: string
  config: Config
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

const BrickWrapper: React.FC<BrickWrapperProps> = (props: BrickWrapperProps) => {
  const context = useContext(Context)
  const [hasDropped, setHasDropped] = useState(false)
  const [hasDroppedOnChild, setHasDroppedOnChild] = useState(false)
  const brick = useMemo(() => {
    const brick = context.bricks[props.config.name]
    if (!brick) {
      throw Error(`brick (${props.config.name}) not found`)
    }
    return brick
  }, [context.bricks, props.config])
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
  const [, drag] = useDrag(
    {
      item: {
        type: 'ItemTypes.BOX',
        config: props.config,
        onRemove: props.onRemoveItemFormParent,
      },
    },
    [props]
  )
  const [{ isOver, isOverCurrent }, drop] = useDrop(
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
        if (Array.isArray(props.config.children) && props.config.children.some((c) => c._key === item.config._key)) {
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
        return true
      },
      hover(item: IDragItem, monitor: DropTargetMonitor) {
        if (!monitor.canDrop()) {
          return
        }
        // const hoverBoundingRect = brickContainer.current?.getBoundingClientRect()
        // const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        // const clientOffset = monitor.getClientOffset()
        // const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
        // if (dragConfig < hoverConfig && hoverClientY < hoverMiddleY) {
        //   return
        // }
        // if (dragConfig > hoverConfig && hoverClientY > hoverMiddleY) {
        //   return
        // }
        props.onDrop && props.onDrop(item.config)
        item.onRemove && item.onRemove(item.config._key)
        item.onRemove = props.onRemoveChild
      },
      drop(_, monitor) {
        const hasDroppedOnChild = monitor.didDrop()
        if (hasDroppedOnChild && !props.greedy) {
          return
        }
        setHasDroppedOnChild(hasDroppedOnChild)
        setHasDropped(true)
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    },
    [props]
  )
  let backgroundColor = 'rgba(0, 0, 0, .5)'
  if (isOverCurrent || (isOver && props.greedy)) {
    backgroundColor = 'darkgreen'
  }
  drag(drop(brickContainer))
  return cloneElement<BrickContainerPropsWithRef>(
    child,
    {
      style: {
        ...props.style,
        // backgroundColor,
        // color: '#fff',
      },
      ref: brickContainer,
      configForm: context.mode === EngineMode.EDIT ? configForm : null,
      className: clx(child.props.className, 'brick', {
        'brick__with-config-form': context.mode === EngineMode.EDIT,
      }),
    },
    hasDropped && <span>dropped {hasDroppedOnChild && ' on child'}</span>,
    ...Children.toArray(child.props.children)
  )
}
export default BrickWrapper
