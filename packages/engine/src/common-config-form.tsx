import React, { useCallback, useMemo, useContext } from 'react'
import { Config, SetConfig } from '@/types'
import { ObjectStringInput } from '@brick/components'
import Context from './context'
import set from 'lodash/set'
import { copyConfig } from './utils/copy-config'

interface CommonEventData {
  target: {
    name: string
    value: unknown
  }
}

interface PropsConfigFormProps {
  config: Config
  onConfigChange: SetConfig
}

const CommonConfigForm = ({
  children,
  config,
  onConfigChange,
}: React.PropsWithChildren<PropsConfigFormProps>): JSX.Element | null => {
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
      return set(newConfig, data.target.name, data.target.value)
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
        <ObjectStringInput
          name="actions"
          value={(config.actions as Record<string, string>) || {}}
          onChange={handleSupplyChange}
        />
      </div>
      <div>
        <label htmlFor="supply.data">Supply Data: </label>
        <ObjectStringInput
          name="supply.data"
          value={(config.supply?.data as Record<string, string>) || {}}
          onChange={handleSupplyChange}
        />
      </div>
      <div>
        <label htmlFor="supply.actions">Supply Actions: </label>
        <ObjectStringInput name="supply.actions" value={config.supply?.actions || {}} onChange={handleSupplyChange} />
      </div>
      {brick.canCustomizeRender && (
        <>
          <div>
            <label htmlFor="render">Render: </label>
            <textarea name="render" value={config.render as string} onChange={handleSupplyChange} />
          </div>
        </>
      )}
      {children}
    </>
  )
}

export default CommonConfigForm
