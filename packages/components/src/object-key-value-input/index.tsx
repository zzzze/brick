import React, { ChangeEvent, useCallback, useEffect, useMemo, useState, useImperativeHandle } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import { ObjectInputProps } from '../object-input-props'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import Item from './item'

interface Instance {
  value: Record<string, string>
}

export const ObjectKeyValueInput = React.forwardRef<Instance, ObjectInputProps>((props: ObjectInputProps, ref) => {
  const [value, setValue] = useState(props.value)
  const [keys, setKeys] = useState<string[]>(() => {
    const value = props.value || {}
    return Object.keys(value)
  })
  const [expandKey, setExpandKey] = useState<string | null>(null)
  useEffect(() => {
    if (!isPlainObject(props.value)) {
      triggerChange({})
    }
  }, [props.value])
  useEffect(() => {
    const newKeys: string[] = keys.slice()
    const valueKeys = Object.keys(props.value || {})
    newKeys.forEach((key) => {
      if (valueKeys.includes(key) && !newKeys.includes(key)) {
        newKeys.push(key)
      }
    })
    valueKeys.forEach((key) => {
      if (!newKeys.includes(key)) {
        newKeys.push(key)
      }
    })
    setKeys(newKeys)
    setValue(props.value)
  }, [props.value])
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
  const instance = useMemo(() => {
    const obj = { value: {} }
    Object.defineProperty(obj, 'value', {
      set(newValue: Record<string, string>) {
        if (newValue) {
          setValue(newValue)
          setKeys(Object.keys(newValue))
          triggerChange(newValue)
        }
      },
    })
    return obj
  }, [])
  useImperativeHandle(ref, () => instance)
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const [index, inputType] = event.target.name.split('-')
      const newValue = keys.reduce<Record<string, string>>((result, key, i) => {
        if (index != i.toString()) {
          result[key] = value?.[key] || ''
        } else {
          if (inputType === 'label') {
            const newKeys = keys.slice()
            newKeys.splice(i, 1, event.target.value)
            setKeys(newKeys)
            result[event.target.value] = value?.[key] || ''
          } else {
            result[key] = event.target.value
          }
        }
        return result
      }, {})
      setValue(newValue)
      triggerChange(newValue)
    },
    [keys, value]
  )
  const isAddBtnDisabled = useMemo(() => {
    return keys.includes('')
  }, [keys])
  const handleAddItem = useCallback(() => {
    if (isAddBtnDisabled) {
      return
    }
    const newKeys = keys.slice()
    newKeys.push('')
    setKeys(newKeys)
  }, [keys, isAddBtnDisabled])
  const handleDeleteItem = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const newValue = {
        ...value,
      }
      const index = parseInt(event.currentTarget.dataset['index'] || '0')
      const newKeys = keys.slice()
      const deletedKey = newKeys.splice(index, 1)[0]
      delete newValue[deletedKey]
      setKeys(newKeys)
      setValue(newValue)
      triggerChange(newValue)
    },
    [keys, value]
  )
  return (
    <div style={{ ...props.style, width: '100%' }}>
      {keys.map((key, index) => {
        return (
          <Item
            value={value}
            expandKey={expandKey}
            setExpandKey={setExpandKey}
            index={index}
            key={index}
            label={key}
            handleChange={handleChange}
            handleDeleteItem={handleDeleteItem}
          />
        )
      })}
      {!isAddBtnDisabled && (
        <div style={{ display: 'inline-block' }} data-testid="add-item" title="add item" onClick={handleAddItem}>
          <AiOutlinePlusCircle />
        </div>
      )}
    </div>
  )
})
