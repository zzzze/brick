import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import { ObjectInputProps } from '../object-input-props'

export const ObjectKeyValueInput: React.FC<ObjectInputProps> = (props: ObjectInputProps) => {
  const [value, setValue] = useState(props.value)
  const [keys, setKeys] = useState<string[]>(() => {
    const value = props.value || {}
    return Object.keys(value)
  })
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
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
    <div>
      <button data-testid="add-item" disabled={isAddBtnDisabled} onClick={handleAddItem}>
        add
      </button>
      {keys.map((key, index) => {
        return (
          <div key={index}>
            <input name={`${index}-label`} type="text" value={key} onChange={handleChange} />
            <input name={`${index}-value`} type="text" value={value?.[key] || ''} onChange={handleChange} />
            <button data-testid={`remove-btn-${index}`} data-index={index} onClick={handleDeleteItem}>
              delete
            </button>
          </div>
        )
      })}
    </div>
  )
}
