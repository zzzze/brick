import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import { ObjectInputProps } from '../object-input-props'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import Item, { InputType } from './item'
import { types } from '@brick/shared'

interface Instance {
  value: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ObjectKeyValueInputProps extends ObjectInputProps {
  types?: InputType[]
}

export const ObjectKeyValueInput = React.forwardRef<Instance, ObjectKeyValueInputProps>(
  (props: ObjectKeyValueInputProps, ref) => {
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
      (event: types.EventData<unknown>) => {
        const [index, inputType] = event.target.name.split('-')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newValue = keys.reduce<Record<string, any>>((result, key, i) => {
          const targetValue = event.target.value
          if (index != i.toString()) {
            result[key] = value?.[key] || ''
          } else {
            if (inputType === 'label') {
              const newKeys = keys.slice()
              newKeys.splice(i, 1, String(targetValue))
              setKeys(newKeys)
              result[String(targetValue)] = value?.[key] || ''
            } else {
              result[key] = targetValue
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
              types={props.types}
              handleChange={handleChange}
              handleDeleteItem={handleDeleteItem}
              getOverlayContainer={props.getOverlayContainer}
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
  }
)

export { InputType }
