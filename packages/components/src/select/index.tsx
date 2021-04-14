import React, {
  useCallback,
  useState,
  ReactElement,
  useMemo,
  PropsWithChildren,
  Children,
  cloneElement,
  useEffect,
} from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import { BsChevronRight } from 'react-icons/bs'
import cls from 'classnames'

export interface IOption<T> {
  label: string
  value: T
}

export interface SelectProps<T> {
  value?: T
  className?: string
  options?: IOption<T>[]
  onChange?: (value: T) => void
  getOverlayContainer?: () => HTMLElement
  children?: React.ReactElement<OptionProps<T>>[]
}

interface IOffset {
  x: number
  y: number
}

const optionMenuContainerName = 'tooltip-container'

export interface OptionProps<T> {
  value: T
  className?: string
  onClick?: (value: T) => void
}

function Option<T>(props: PropsWithChildren<OptionProps<T>>): ReactElement {
  const handleClick = useCallback(() => {
    props.onClick && props.onClick(props.value)
  }, [props.value])
  return (
    <span className={cls('select-option', props.className)} onClick={handleClick}>
      {props.children}
    </span>
  )
}

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

function Select<T>(props: SelectProps<T>): ReactElement {
  const [showOptions, setShowOptions] = useState(false)
  const [optionMenuId] = useState(Math.random().toString(36).slice(2))
  const ref = React.useRef<HTMLElement>(null)
  const container = useMemo(() => {
    if (!props.getOverlayContainer) {
      return document.body
    }
    return props.getOverlayContainer()
  }, [props.getOverlayContainer])
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!ref.current) {
        return
      }
      if (ref.current !== event.target && !ref.current.contains(event.target as Node)) {
        setShowOptions(false)
      }
    },
    [ref.current]
  )
  useEffect(() => {
    window.addEventListener('click', handleClickOutside, true)
    return () => {
      window.removeEventListener('click', handleClickOutside, true)
      container
    }
  }, [])
  useEffect(() => {
    return () => {
      const element = container.getElementsByClassName(`${optionMenuContainerName}-${optionMenuId}`)?.[0]
      if (element) {
        container.removeChild(element)
      }
    }
  }, [container])

  const overlayContainer: Element = useMemo(() => {
    let element = container.getElementsByClassName(`${optionMenuContainerName}-${optionMenuId}`)?.[0]
    if (!element) {
      element = document.createElement('div') as HTMLElement
      element.className = optionMenuContainerName
      container.appendChild(element)
    }
    return element
  }, [container])
  const value = useMemo(() => {
    if (!props.value) {
      return null
    }
    let selectedOption: ReactElement<OptionProps<T>> | string | null = null
    if (props.options) {
      props.options.map((option) => {
        if (option.value === props.value) {
          selectedOption = option.label
        }
      })
    } else {
      Children.forEach(props.children, (child) => {
        if (child && child.props.value === props.value) {
          selectedOption = cloneElement(child, {
            className: '',
          })
        }
      })
    }
    if (selectedOption === null) {
      selectedOption = ''
    }
    return selectedOption
  }, [props.children, props.value, props.options])
  const handleValueChange = useCallback((value: T) => {
    props.onChange && props.onChange(value)
  }, [])
  const overlay = useMemo(() => {
    const rect = ref.current?.getBoundingClientRect() || { width: 0, height: 0 }
    const offset = offsetFromContainer(ref.current, container)
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
                <span key={option.label} className="select-option" onClick={() => handleValueChange(option.value)}>
                  {option.label}
                </span>
              )
            })}
          {!props.options &&
            props.children &&
            Children.map(props.children, (child) => {
              return cloneElement(child, {
                onClick: handleValueChange,
              })
            })}
        </div>
      </CSSTransition>,
      overlayContainer
    )
  }, [showOptions, container, props.options])
  const handleClick = useCallback(() => setShowOptions(true), [])
  const className = useMemo(
    () =>
      cls('select', {
        'select--active': showOptions,
      }),
    [showOptions]
  )
  return (
    <>
      <span className={className} ref={ref} onClick={handleClick}>
        {value} <BsChevronRight className="select__arrow" />
      </span>
      {overlay}
    </>
  )
}

Select.Option = Option

export { Select }
