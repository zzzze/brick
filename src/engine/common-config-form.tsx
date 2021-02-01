import React, { useCallback, useMemo, useContext } from 'react'
import { Config, SetConfig } from '@/types'
import ObjectStringInput, { CommonEventData } from '@/components/object-string-input'
import Context from '@/engine/context'
import { set as _set } from 'lodash'
import { copyConfig } from '@/utils/copy-config'

interface PropsConfigFormProps {
  config: Config
  onConfigChange: SetConfig
}
const CommonConfigForm = ({ config, onConfigChange }: PropsConfigFormProps): JSX.Element | null => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return context.bricks[config.name]
  }, [context.bricks, config])
  const handleChange = useCallback((event: CommonEventData) => {
    onConfigChange((config) => {
      return {
        ...config,
        [event.target.name]: event.target.value as string,
      }
    })
  }, [])
  const handleSupplyChange = useCallback((data: CommonEventData) => {
    onConfigChange((config) => {
      const newConfig = copyConfig(config)
      return _set(newConfig, data.target.name, data.target.value)
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
        <ObjectStringInput name="actions" value={config.actions || {}} onChange={handleSupplyChange} />
      </div>
      <div>
        <label htmlFor="supply.data">Supply Data: </label>
        <ObjectStringInput name="supply.data" value={config.supply?.data || {}} onChange={handleSupplyChange} />
      </div>
      <div>
        <label htmlFor="supply.actions">Supply Actions: </label>
        <ObjectStringInput name="supply.actions" value={config.supply?.actions || {}} onChange={handleSupplyChange} />
      </div>
      {brick.canCustomizeRender && (
        <>
          <div>
            <label htmlFor="render.modules">Render Modules: </label>
            <ObjectStringInput
              name="render.modules"
              value={config.render?.modules || {}}
              onChange={handleSupplyChange}
            />
          </div>
          <div>
            <label htmlFor="render.func">Render Func: </label>
            <textarea name="render.func" value={config.render?.func || ''} onChange={handleSupplyChange} />
          </div>
        </>
      )}
    </>
  )
}

export default CommonConfigForm
