import React, { ChangeEvent, useCallback, useEffect, useState, useImperativeHandle, useRef, useMemo } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import { ObjectInputProps } from '../object-input-props'

interface Instance {
  value: string
}

export const ObjectStringInput = React.forwardRef<Instance, ObjectInputProps>((props, ref) => {
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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const instance = useMemo(() => {
    const obj = { value: '' }
    Object.defineProperty(obj, 'value', {
      set(newValue: Record<string, string>) {
        if (newValue) {
          setValueStr(JSON.stringify(newValue))
        }
      },
    })
    return obj
  }, [])
  useImperativeHandle(ref, () => instance)
  useEffect(() => {
    if (!isPlainObject(props.value) && typeof props.value !== 'undefined') {
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
  return <textarea name={props.name} ref={inputRef} value={valueStr} onChange={handleChange} />
})
