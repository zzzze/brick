import React, { ChangeEvent, useCallback } from 'react'
import { Config, SetConfig } from '@/types'
import ObjectStringInput, { ObjectInputEventData } from '@/components/object-string-input'

interface PropsConfigFormProps {
  config: Config
  onConfigChange: SetConfig
}
const CommonConfigForm = ({ config, onConfigChange }: PropsConfigFormProps): JSX.Element | null => {
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onConfigChange((config) => {
      return {
        ...config,
        [event.target.name]: event.target.value,
      }
    })
  }, [])
  const handleSupplyChange = useCallback((data: ObjectInputEventData) => {
    onConfigChange((config) => {
      return {
        ...config,
        supply: {
          ...config.supply,
          data: {
            ...config.supply?.data,
            ...(data.target.name === 'supply.data' ? data.target.value : {}),
          },
          actions: {
            ...config.supply?.actions,
            ...(data.target.name === 'supply.actions' ? (data.target.value as Record<string, string>) : {}),
          },
        },
      }
    })
  }, [])
  const handleActionsChange = useCallback((data: ObjectInputEventData) => {
    onConfigChange((config) => {
      return {
        ...config,
        actions: {
          ...config.actions,
          ...(data.target.value as Record<string, string>),
        },
      }
    })
  }, [])
  return (
    <>
      <div>
        <label htmlFor="id">ID: </label>
        <input type="text" name="id" value={config.id || ''} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="actions">Actions: </label>
        <ObjectStringInput name="actions" value={config.actions || {}} onChange={handleActionsChange} />
      </div>
      <div>
        <label htmlFor="supply.data">Supply Data: </label>
        <ObjectStringInput name="supply.data" value={config.supply?.data || {}} onChange={handleSupplyChange} />
      </div>
      <div>
        <label htmlFor="supply.actions">Supply Actions: </label>
        <ObjectStringInput name="supply.actions" value={config.supply?.actions || {}} onChange={handleSupplyChange} />
      </div>
    </>
  )
}

export default CommonConfigForm
