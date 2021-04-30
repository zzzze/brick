import React, { useCallback, useState, FC, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { theme } from '@brick/shared'
import { Transition } from 'react-transition-group'
import { createUseStyles } from 'react-jss'
import debounce from 'lodash/debounce'
import { EXITED, ENTERING, ENTERED, EXITING } from 'react-transition-group/Transition'
import clx from 'classnames'

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

const borderWidth = 5
const arrowOffsetY = 10

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      tooltip: {
        position: 'absolute',
        borderRadius: '5px',
        maxWidth: '300px',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        transformOrigin: '-5px 15px',
        zIndex: 9999,
        transition: `all ${theme.transitions.duration.shortest}ms`,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-10px',
          top: `${arrowOffsetY}px`,
          borderStyle: 'solid',
          borderWidth: borderWidth,
          borderColor: 'transparent',
          borderRightColor: 'rgba(0, 0, 0, 0.8)',
        },
      },
      tooltipEntering: {
        opacity: 0,
        transform: 'scale(0.4) translateX(-20px)',
      },
      tooltipEntered: {
        opacity: 1,
        transform: 'scale(1) translateX(0)',
      },
      tooltipExiting: {
        opacity: 0,
        transform: 'scale(0.4) translateX(-20px)',
      },
      tooltipExited: {
        opacity: 0,
        transform: 'scale(0.4) translateX(-20px)',
      },
    }
  },
  { name: 'Tooltip' }
)

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
  const classes = useStyles()
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
  }, [isHover])
  const tooltip: Element | null = useMemo(() => {
    if (!container) {
      return null
    }
    let element = container.getElementsByClassName(name)?.[0]
    if (!element) {
      element = document.createElement('div') as HTMLElement
      element.className = name
      container.appendChild(element)
    }
    return element
  }, [container])
  const overlay = useMemo(() => {
    if (!tooltip) {
      return null
    }
    const rect = ref.current?.getBoundingClientRect() || { width: 0, height: 0 }
    const offset = offsetFromContainer(ref.current, container)
    const style: React.CSSProperties = {
      top: offset.y - borderWidth - arrowOffsetY + rect.height / 2,
      left: offset.x + rect.width + 10,
    }
    return ReactDOM.createPortal(
      <Transition in={isHover} timeout={200} unmountOnExit>
        {(state) => (
          <div
            className={clx(classes.tooltip, {
              [classes.tooltipEntering]: state === ENTERING,
              [classes.tooltipEntered]: state === ENTERED,
              [classes.tooltipExiting]: state === EXITING,
              [classes.tooltipExited]: state === EXITED,
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={style}>
            {props.content}
          </div>
        )}
      </Transition>,
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
