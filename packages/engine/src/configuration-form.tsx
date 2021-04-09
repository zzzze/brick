import React, { useCallback, useMemo, useContext } from 'react'
import { Config, SetConfig, DataObject } from '@/types'
import EnginxContext from './context'
import { DataTypeDefinition } from './data/normalize-data-type'
import { DataType } from './data/data-type'
import normalizeDataType from './data/normalize-data-type'
import FormItem from './form-item/form-item'
import ConfigurationFormContext from './form-item/context'

interface PropsConfigurationFormProps {
  config: Config
  onConfigChange: SetConfig
  onDataChange: (data: DataObject) => void
  autoCommit: boolean
  isVoidElement: boolean
  getPopupContainer?: () => HTMLElement
}

const defaultFormItems: Record<string, DataTypeDefinition> = {
  id: {
    type: 'string',
    default: '',
    label: 'ID',
    placeholder: 'ID of brick instance',
    tips: 'ID of brick instance',
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
}

const ConfigurationForm = ({
  config,
  onConfigChange,
  onDataChange,
  autoCommit,
  isVoidElement,
  getPopupContainer,
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
          commit: engineCtx.transactionCommit,
          autoCommit,
        }}>
        {defaultFormItemKeys.map((key) => {
          const td = defaultFormItemFullDefs[key]
          if (key === 'render' && !brick.canCustomizeRender) {
            return null
          }
          if (['data.wrapperStyle'].includes(key) && !isVoidElement) {
            return null
          }
          return (
            <FormItem
              key={key}
              getPopupContainer={getPopupContainer}
              tips={td.tips}
              data-testid={`${config._key}-${td.testID ?? key}`}
              label={td?.label || key}
              name={key}>
              {td.formItem()}
            </FormItem>
          )
        })}
      </ConfigurationFormContext.Provider>
      <ConfigurationFormContext.Provider
        value={{
          data: config.data || {},
          onChange: onDataChange,
          commit: engineCtx.transactionCommit,
          autoCommit,
        }}>
        {Object.keys(dataTypes).map((key) => {
          const td = dataTypes[key]
          if (typeof td === 'string') {
            return null
          }
          return (
            <FormItem
              key={key}
              getPopupContainer={getPopupContainer}
              tips={td.tips}
              data-testid={`${config._key}-${td.testID ?? key}`}
              label={td?.label || key}
              name={key}>
              {td.formItem()}
            </FormItem>
          )
        })}
      </ConfigurationFormContext.Provider>
    </>
  )
}

export default ConfigurationForm
