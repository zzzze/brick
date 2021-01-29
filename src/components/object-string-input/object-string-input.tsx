import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { isPlainObject } from 'lodash'

export interface ObjectInputEventData {
  target: {
    name: string
    value: Record<string, unknown>
  }
}

interface ObjectInputProps {
  name?: string
  value?: Record<string, unknown>
  onChange?: (data: ObjectInputEventData) => void
}

const ObjectStringInput: React.FC<ObjectInputProps> = (props: ObjectInputProps) => {
  const [valueStr, setValueStr] = useState(JSON.stringify(props.value))
  const triggerChange = useCallback(
    (obj: Record<string, string>) => {
      props.onChange &&
        props.onChange({
          target: {
            name: props.name || '',
            value: obj,
          },
        })
    },
    [props.name, props.onChange]
  )
  useEffect(() => {
    if (!isPlainObject(props.value)) {
      setValueStr('{}')
      triggerChange({})
    } else {
      setValueStr(JSON.stringify(props.value || {}))
    }
  }, [props.value, triggerChange])
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value || ''
      setValueStr(value)
      try {
        const obj = JSON.parse(value) as Record<string, string>
        triggerChange(obj)
      } catch (err) {
        if (__DEV__) {
          console.error(err)
        }
      }
    },
    [triggerChange]
  )
  return <textarea name={props.name} value={valueStr} onChange={handleChange} />
}

export default ObjectStringInput
