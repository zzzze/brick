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

interface PropsConfigurationFormProps {
  config: Config
  onConfigChange: SetConfig
}

const CommonConfigurationForm = ({
  children,
  config,
  onConfigChange,
}: React.PropsWithChildren<PropsConfigurationFormProps>): JSX.Element | null => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return context.bricks[config.name]
  }, [context.bricks, config])
  const handleChange = useCallback((data: CommonEventData) => {
    onConfigChange((config) => {
      const newConfig = copyConfig(config)
      return set(newConfig, data.target.name, data.target.value)
    })
  }, [])
  return (
    <>
      <div className="config-form__item">
        <label className="config-form__label" htmlFor="id">
          ID:{' '}
        </label>
        <input type="text" name="id" value={config.id || ''} onChange={handleChange} />
      </div>
      <div className="config-form__item">
        <label className="config-form__label" htmlFor="actions">
          Actions:{' '}
        </label>
        <ObjectStringInput
          name="actions"
          value={(config.actions as Record<string, string>) || {}}
          onChange={handleChange}
        />
      </div>
      <div className="config-form__item">
        <label className="config-form__label" htmlFor="supply.data">
          Supply Data:{' '}
        </label>
        <ObjectStringInput
          name="supply.data"
          value={(config.supply?.data as Record<string, string>) || {}}
          onChange={handleChange}
        />
      </div>
      <div className="config-form__item">
        <label className="config-form__label" htmlFor="supply.actions">
          Supply Actions:{' '}
        </label>
        <ObjectStringInput name="supply.actions" value={config.supply?.actions || {}} onChange={handleChange} />
      </div>
      {brick.canCustomizeRender && (
        <>
          <div className="config-form__item">
            <label className="config-form__label" htmlFor="render">
              Render:{' '}
            </label>
            <textarea name="render" value={config.render as string} onChange={handleChange} />
          </div>
        </>
      )}
      {children}
    </>
  )
}

export default CommonConfigurationForm
