import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import isPlainObject from 'lodash/isPlainObject'

export interface ObjectInputEventData {
  target: {
    name: string
    value: Record<string, string>
  }
}

interface ObjectInputProps {
  name?: string
  value?: Record<string, string>
  onChange?: (data: ObjectInputEventData) => void
}

export const ObjectKeyValueInput: React.FC<ObjectInputProps> = (props: ObjectInputProps) => {
  const [keys, setKeys] = useState<string[]>(() => {
    const value = props.value || {}
    return Object.keys(value)
  })
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
  useEffect(() => {
    if (!isPlainObject(props.value)) {
      triggerChange({})
    }
  }, [props.value])
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [index, inputType] = event.target.name.split('-')
      const value = keys.reduce<Record<string, string>>((result, key, i) => {
        if (index != i.toString()) {
          result[key] = props.value?.[key] || ''
        } else {
          if (inputType === 'label') {
            const newKeys = keys.slice()
            newKeys.splice(i, 1, event.target.value)
            setKeys(newKeys)
            result[event.target.value] = props.value?.[key] || ''
          } else {
            result[key] = event.target.value
          }
        }
        return result
      }, {})
      triggerChange(value)
    },
    [props.value, keys]
  )
  const handleAddItem = useCallback(() => {
    const newKeys = keys.slice()
    newKeys.push('')
    setKeys(newKeys)
  }, [keys])
  const isAddBtnDisabled = useMemo(() => {
    return keys.includes('')
  }, [keys])
  const handleDeleteItem = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const newValue = {
        ...props.value,
      }
      const index = parseInt(event.currentTarget.dataset['index'] || '0')
      const newKeys = keys.slice()
      const deletedKey = newKeys.splice(index, 1)[0]
      delete newValue[deletedKey]
      setKeys(newKeys)
      triggerChange(newValue)
    },
    [keys, props.value]
  )
  return (
    <div>
      <button data-testid="add-item" disabled={isAddBtnDisabled} onClick={handleAddItem}>
        add
      </button>
      {keys.map((key, index) => {
        return (
          <div key={index}>
            <input name={`${index}-label`} type="text" value={key} onChange={handleChange} />
            <input name={`${index}-value`} type="text" value={props.value?.[key] || ''} onChange={handleChange} />
            <button data-testid={`remove-btn-${index}`} data-index={index} onClick={handleDeleteItem}>
              delete
            </button>
          </div>
        )
      })}
    </div>
  )
}
