import React, { useCallback, useMemo, useContext } from 'react'
import { Blueprint, SetBlueprint, DataObject } from '@/types'
import EnginxContext from './context'
import { DataTypeDefinition } from './data/normalize-data-type'
import { DataType } from './data/data-type'
import normalizeDataType from './data/normalize-data-type'
import FormItem from './form-item/form-item'
import ConfigurationFormContext from './form-item/context'
import { InputType } from '@brick/components'
import clusterBrick from './cluster-brick'

interface PropsConfigurationFormProps {
  blueprint: Blueprint
  onBlueprintChange: SetBlueprint
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
    fieldTypes: [InputType.CODE, InputType.STRING],
  },
  handlers: {
    type: 'object',
    default: {},
    label: 'Handlers',
    fieldTypes: [InputType.CODE, InputType.STRING],
  },
  'supply.data': {
    type: 'object',
    default: {},
    label: 'Supply Data',
    fieldTypes: [InputType.STRING, InputType.BOOLEAN],
  },
  'supply.actions': {
    type: 'object',
    default: {},
    label: 'Supply Actions',
    fieldTypes: [InputType.CODE, InputType.STRING],
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
    fieldTypes: [InputType.STRING],
  },
}

const ConfigurationForm = ({
  blueprint,
  onBlueprintChange,
  onDataChange,
  autoCommit,
  isVoidElement,
  getPopupContainer,
}: PropsConfigurationFormProps): JSX.Element | null => {
  const engineCtx = useContext(EnginxContext)
  const brick = useMemo(() => {
    return engineCtx.bricks[blueprint.name]
  }, [engineCtx.bricks, blueprint])
  const handleChange = useCallback((data: Record<string, unknown>) => {
    onBlueprintChange((blueprint) => {
      return {
        ...blueprint,
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
  const handleClick = useCallback(() => {
    const newBrick = clusterBrick(blueprint)
    const r = window.prompt("Please enter new brick name")
    if (r) {
      newBrick.name = r
    }
    engineCtx.registerBrick(newBrick)
  }, [brick])
  const hasChildren = useMemo(() => {
    return Array.isArray(blueprint.children) && !!blueprint.children.length
  }, [blueprint])
  return (
    <>
      {hasChildren && (
        <button onClick={handleClick} style={{marginBottom: 10}}>Cluster</button>
      )}
      <ConfigurationFormContext.Provider
        value={{
          data: { ...blueprint } as Record<string, unknown>,
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
              getOverlayContainer={getPopupContainer}
              tips={td.tips}
              data-testid={`${blueprint._key}-${td.testID ?? key}`}
              label={td?.label || key}
              types={td.fieldTypes}
              name={key}>
              {td.formItem()}
            </FormItem>
          )
        })}
      </ConfigurationFormContext.Provider>
      <ConfigurationFormContext.Provider
        value={{
          data: blueprint.data || {},
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
              getOverlayContainer={getPopupContainer}
              tips={td.tips}
              data-testid={`${blueprint._key}-${td.testID ?? key}`}
              types={[InputType.STRING]}
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
