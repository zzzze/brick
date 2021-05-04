import React, { CSSProperties, FC, useCallback, useEffect, useState } from 'react'
import { EventData } from '@brick/shared/types/form'

export interface SwitchProps {
  value?: boolean
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

const Switch: FC<SwitchProps> = (props: SwitchProps) => {
  const [value, setValue] = useState(props.value)
  useEffect(() => {
    setValue(props.value)
  }, [props.value])
  const handleClick = useCallback(() => {
    const newValue = !value
    setValue(newValue)
    props.onChange &&
      props.onChange({
        target: {
          name: props.name ?? '',
          value: newValue,
        },
      })
  }, [value])
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
}

export { Switch }
