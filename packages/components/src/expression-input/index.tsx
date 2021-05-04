import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  ChangeEvent,
  CSSProperties,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import { EventData } from '@brick/shared/types/form'
import { theme } from '@brick/shared'
import { createUseStyles } from 'react-jss'

interface Instance {
  value: string
}

export interface IOption {
  label: string
  value: string
}

export interface ExpressionInputProps {
  value?: string
  className?: string
  name?: string
  options?: IOption[]
  style?: CSSProperties
  onChange?: (value: EventData<string>) => void
  getOverlayContainer?: () => HTMLElement
}

interface IOffset {
  x: number
  y: number
}

const useStyles = createUseStyles((theme: theme.Theme) => {
  return {
    delimiter: {
      fontFamily: 'monospace',
      fontSize: theme.typography.fontSize,
      color: theme.palette.grey[500],
    },
  }
})

const optionMenuContainerName = 'option-container'

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

const parseValue = (value?: string) => {
  if (typeof value === 'string') {
    return value?.replace(/^\{\{\s*|\s*\}\}$/g, '') ?? ''
  }
  return ''
}

export const ExpressionInput = React.forwardRef((props: ExpressionInputProps, ref: ForwardedRef<Instance>) => {
  const classes = useStyles()
  const [showOptions, setShowOptions] = useState(false)
  const [optionMenuId] = useState(Math.random().toString(36).slice(2))
  const [value, setValue] = useState(parseValue(props.value))
  const wrapper = React.useRef<HTMLElement>(null)
  const container = useMemo(() => {
    if (!props.getOverlayContainer) {
      return document.body
    }
    return props.getOverlayContainer()
  }, [props.getOverlayContainer])
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!wrapper.current) {
        return
      }
      if (wrapper.current !== event.target && !wrapper.current.contains(event.target as Node)) {
        setShowOptions(false)
      }
    },
    [wrapper.current]
  )
  useEffect(() => {
    setValue(parseValue(props.value))
  }, [props.value])
  useEffect(() => {
    window.addEventListener('click', handleClickOutside, true)
    return () => {
      window.removeEventListener('click', handleClickOutside, true)
      container
    }
  }, [])
  useEffect(() => {
    return () => {
      if (!container) {
        return
      }
      const element = container.getElementsByClassName(`${optionMenuContainerName}-${optionMenuId}`)?.[0]
      if (element) {
        container.removeChild(element)
      }
    }
  }, [container])
  const overlayContainer: Element | null = useMemo(() => {
    if (!container) {
      return null
    }
    let element = container.getElementsByClassName(`${optionMenuContainerName}-${optionMenuId}`)?.[0]
    if (!element) {
      element = document.createElement('div') as HTMLElement
      element.className = optionMenuContainerName
      container.appendChild(element)
    }
    return element
  }, [container])
  const triggerChange = useCallback((value: string) => {
    setValue(value)
    props.onChange &&
      props.onChange({
        target: {
          name: props.name ?? '',
          value: '{{' + value + '}}',
        },
      })
  }, [])
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    triggerChange(event.target.value)
  }, [])
  const instance = useMemo(() => {
    const obj = { value: '' }
    Object.defineProperty(obj, 'value', {
      set(newValue: string) {
        if (newValue) {
          newValue = parseValue(newValue)
          setValue(newValue)
          triggerChange(newValue)
        }
      },
    })
    return obj
  }, [])
  useImperativeHandle(ref, () => instance)
  const overlay = useMemo(() => {
    if (!overlayContainer) {
      return null
    }
    const rect = wrapper.current?.getBoundingClientRect() || { width: 0, height: 0 }
    const offset = offsetFromContainer(wrapper.current, container)
    const style: React.CSSProperties = {
      top: offset.y + rect.height + 10,
      left: offset.x,
    }
    return ReactDOM.createPortal(
      <CSSTransition in={showOptions} timeout={200} unmountOnExit classNames="fade-down">
        <div className="select__overlay" style={style}>
          {props.options &&
            props.options.map((option) => {
              return (
                <span key={option.label} className="select-option" onClick={() => triggerChange(option.value)}>
                  {option.label}
                </span>
              )
            })}
        </div>
      </CSSTransition>,
      overlayContainer
    )
  }, [showOptions, container, props.options])
  return (
    <span ref={wrapper} style={props.style}>
      <span className={classes.delimiter}>{'{{  '}</span>
      <input type="text" value={value} onChange={handleChange} />
      <span className={classes.delimiter}>{'  }}'}</span>
      {overlay}
    </span>
  )
})
