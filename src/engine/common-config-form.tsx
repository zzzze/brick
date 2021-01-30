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
        supply: data.target.value,
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
        <label htmlFor="supply">Supply: </label>
        <ObjectStringInput name="supply" value={config.supply || {}} onChange={handleSupplyChange} />
      </div>
    </>
  )
}

export default CommonConfigForm
