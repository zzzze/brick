import React, { useCallback, useMemo, useContext } from 'react'
import { Config, SetConfig, DataObject } from '@/types'
import EnginxContext from './context'
import { DataTypeDefinition } from './data/normalize-data-type'
import { DataType } from './data/data-type'
import normalizeDataType from './data/normalize-data-type'
import { ConfigurationFormContext, ConfigurationFormItem as FormItem } from '@brick/components'

interface PropsConfigurationFormProps {
  config: Config
  onConfigChange: SetConfig
  onDataChange: (data: DataObject) => void
  autoCommit: boolean
  isVoidElement: boolean
}

const defaultFormItems: Record<string, DataTypeDefinition> = {
  id: {
    type: 'string',
    default: '',
    label: 'ID',
    placeholder: 'ID of brick instance',
  },
  actions: {
    type: 'object',
    default: {},
    label: 'Actions',
  },
  'supply.data': {
    type: 'object',
    default: {},
    label: 'Supply Data',
  },
  'supply.actions': {
    type: 'object',
    default: {},
    label: 'Supply Actions',
  },
  render: {
    type: 'code',
    default: '',
    label: 'Render',
  },
  'data.wrapperStyle': {
    type: 'object',
    default: {},
    label: 'Wrapper Style',
  },
  'data.styleInEditor': {
    type: 'object',
    default: {},
    label: 'Style in Editor',
  },
}

const ConfigurationForm = ({
  config,
  onConfigChange,
  onDataChange,
  autoCommit,
  isVoidElement,
}: PropsConfigurationFormProps): JSX.Element | null => {
  const engineCtx = useContext(EnginxContext)
  const brick = useMemo(() => {
    return engineCtx.bricks[config.name]
  }, [engineCtx.bricks, config])
  const handleChange = useCallback((data: Record<string, unknown>) => {
    onConfigChange((config) => {
      return {
        ...config,
        ...data,
      }
    })
  }, [])
  const defaultFormItemKeys = useMemo(() => Object.keys(defaultFormItems), [])
  const defaultFormItemFullDefs = useMemo(() => {
    return defaultFormItemKeys.reduce<Record<string, DataType>>((result, key) => {
      result[key] = {
        ...defaultFormItems[key],
        formItem: engineCtx.dataTypes[defaultFormItems[key].type].formItem,
        isValid: engineCtx.dataTypes[defaultFormItems[key].type].isValid,
      }
      return result
    }, {})
  }, [engineCtx.dataTypes])
  const dataTypes = useMemo(() => {
    return normalizeDataType(engineCtx.dataTypes, brick.dataTypes)
  }, [engineCtx.dataTypes, brick.dataTypes])
  return (
    <>
      <ConfigurationFormContext.Provider
        value={{
          data: { ...config } as Record<string, unknown>,
          onChange: handleChange,
          autoCommit,
        }}>
        {defaultFormItemKeys.map((key) => {
          const td = defaultFormItemFullDefs[key]
          if (key === 'render' && !brick.canCustomizeRender) {
            return null
          }
          if (['data.wrapperStyle', 'data.styleInEditor'].includes(key) && !isVoidElement) {
            return null
          }
          return (
            <FormItem key={key} data-testid={td.testID} label={td?.label || key} name={key}>
              {td.formItem()}
            </FormItem>
          )
        })}
      </ConfigurationFormContext.Provider>
      <ConfigurationFormContext.Provider
        value={{
          data: config.data || {},
          onChange: onDataChange,
          autoCommit,
        }}>
        {Object.keys(dataTypes).map((key) => {
          const td = dataTypes[key]
          if (typeof td === 'string') {
            return null
          }
          return (
            <FormItem key={key} data-testid={td.testID} label={td?.label || key} name={key}>
              {td.formItem()}
            </FormItem>
          )
        })}
      </ConfigurationFormContext.Provider>
    </>
  )
}

export default ConfigurationForm
