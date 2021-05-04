import React, {
  CSSProperties,
  ForwardedRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { EventData } from '@brick/shared/types/form'

export interface SwitchProps {
  value?: boolean
  defaultValue?: boolean
  onChange?: (value: EventData<unknown>) => void
  name?: string
  hidden?: boolean
  style?: CSSProperties
}

const style: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  height: 24,
  borderRadius: 12,
  width: 50,
  border: 'solid 1px #ccc',
}

const sliderStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 24,
  height: 24,
  borderRadius: '50%',
  transition: 'all 200ms ease',
  boxSizing: 'border-box',
  background: '#fff',
}

interface Instance {
  value: boolean
}

const Switch = React.forwardRef((props: SwitchProps, ref: ForwardedRef<Instance>) => {
  const [value, setValue] = useState(props.value)
  const triggerChange = useCallback(
    (value: boolean) => {
      props.onChange &&
        props.onChange({
          target: {
            name: props.name ?? '',
            value,
          },
        })
    },
    [props.name, props.onChange]
  )
  useEffect(() => {
    if (typeof value === 'undefined' && typeof props.defaultValue !== 'undefined') {
      setValue(props.defaultValue)
      triggerChange(props.defaultValue)
    }
  }, [value])
  const instance = useMemo(() => {
    const obj = { value: false }
    Object.defineProperty(obj, 'value', {
      set(newValue: boolean) {
        if (typeof newValue !== 'undefined') {
          setValue(newValue)
          triggerChange(newValue)
        }
      },
    })
    return obj
  }, [triggerChange])
  useImperativeHandle(ref, () => instance)
  useEffect(() => {
    if (typeof props.value !== 'undefined') {
      setValue(props.value)
    }
  }, [props.value])
  const handleClick = useCallback(() => {
    const newValue = !value
    setValue(newValue)
    triggerChange(newValue)
  }, [value, triggerChange])
  return (
    <div
      onClick={handleClick}
      style={{
        ...style,
        background: value ? '#999' : '#ddd',
        display: typeof props.hidden !== 'undefined' && !props.hidden ? 'none' : 'inline-block',
        ...props.style,
      }}>
      <div
        style={{
          ...sliderStyle,
          left: value ? '100%' : 0,
          transform: value ? 'translateX(-100%)' : 'translateX(0)',
        }}></div>
    </div>
  )
})

export { Switch }
