import React, { useCallback, useState, FC, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import debounce from 'lodash/debounce'

export interface TooltipProps {
  content: React.ReactElement | string
  getOverlayContainer?: () => HTMLElement
  children: React.ReactElement
}

interface IOffset {
  x: number
  y: number
}

const name = 'tooltip-container'

function offsetFromContainer(node: HTMLElement | null, container: HTMLElement): IOffset {
  if (!node || !node.offsetParent) {
    return {
      x: 0,
      y: 0,
    }
  }
  const offsetOfNode = {
    x: node.offsetLeft,
    y: node.offsetTop,
  }
  if (node.offsetParent === document.body || node.offsetParent === container) {
    return offsetOfNode
  }
  const offsetOfParent = offsetFromContainer(node.offsetParent as HTMLElement, container)
  return {
    x: offsetOfNode.x + offsetOfParent.x,
    y: offsetOfNode.y + offsetOfParent.y,
  }
}

const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
  const [isHover, setIsHover] = useState(false)
  const ref = React.useRef<HTMLElement>(null)
  const handleHoverChange = useCallback(
    debounce((hover) => setIsHover(hover), 200),
    []
  )
  const handleMouseEnter = useCallback(() => {
    handleHoverChange(true)
  }, [])
  const handleMouseLeave = useCallback(() => {
    handleHoverChange(false)
  }, [])
  const container = useMemo(() => {
    if (!props.getOverlayContainer) {
      return document.body
    }
    return props.getOverlayContainer()
  }, [props.getOverlayContainer])
  const tooltip: Element = useMemo(() => {
    let element = container.getElementsByClassName(name)?.[0]
    if (!element) {
      element = document.createElement('div') as HTMLElement
      element.className = name
      container.appendChild(element)
    }
    return element
  }, [])
  const overlay = useMemo(() => {
    const rect = ref.current?.getBoundingClientRect() || { width: 0, height: 0 }
    const offset = offsetFromContainer(ref.current, container)
    const style: React.CSSProperties = {
      top: offset.y + rect.height / 2 - 12.5,
      left: offset.x + rect.width + 10,
    }
    return ReactDOM.createPortal(
      <CSSTransition in={isHover} timeout={200} unmountOnExit classNames="fade">
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="tooltip" style={style}>
          {props.content}
        </div>
      </CSSTransition>,
      tooltip
    )
  }, [isHover, container])
  const child = React.Children.only(props.children)
  return (
    <>
      {React.cloneElement(child, {
        ref,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })}
      {overlay}
    </>
  )
}

export { Tooltip }
