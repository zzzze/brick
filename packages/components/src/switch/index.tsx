import React, { CSSProperties, FC, useCallback } from 'react'
import { EventData } from '@brick/shared/types/form'

export interface SwitchProps {
  value?: boolean
  onChange?: (value: EventData<unknown>) => void
  name?: string
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
  const handleClick = useCallback(() => {
    props.onChange &&
      props.onChange({
        target: {
          name: props.name ?? '',
          value: !props.value,
        },
      })
  }, [props.value])
  return (
    <div onClick={handleClick} style={{ ...style, background: props.value ? '#999' : '#ddd' }}>
      <div
        style={{
          ...sliderStyle,
          left: props.value ? '100%' : 0,
          transform: props.value ? 'translateX(-100%)' : 'translateX(0)',
        }}></div>
    </div>
  )
}

export { Switch }
