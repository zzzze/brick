import React, { useCallback, useMemo, useEffect, useState, useContext } from 'react'
import {
  Config,
  DataObject,
  EngineMode,
  SetConfig,
  SetConfigFn,
  SetDataFn,
  SetData,
  SetDataOptions,
  Action,
  Actions,
  SupplyInRender,
  idPrefix,
} from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'
import { interpreteParam } from '@/utils'
import Context from '@/engine/context'

interface BrickRenderProps {
  config: Config
  supply: SupplyInRender
  mode: EngineMode
  setConfig: SetConfig
}

function getData(
  keys: string[],
  data: DataObject,
  pSupply: Record<string, unknown>,
  defaultData: DataObject
): Record<string, unknown> {
  return keys.reduce<Record<string, unknown>>((result, key) => {
    let value = data[key] || defaultData[key]
    if (typeof value === 'string') {
      value = interpreteParam(value, pSupply)
    }
    result[key] = value
    return result
  }, {})
}

function compileAction(fn: string, setData: SetData): Action {
  return (...args: unknown[]) => {
    void(setData) // cheak on compiler
    let action: (...args: unknown[]) => void = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    eval(`action = ${fn}`) // TODO: compile in build mode
    return action(...args)
  }
}

function compileActions(actions: Record<string, unknown>, setData: SetData): Record<string, unknown> {
  return Object.keys(actions).reduce<Record<string, unknown>>((result, key) => {
    const value = actions[key]
    if (typeof value === 'string' && !value.startsWith('{{')) {
      result[key] = compileAction(value, setData)
    } else {
      result[key] = value
    }
    return result
  }, {})
}

const BrickRenderer: React.FC<BrickRenderProps> = ({ config, supply: pSupply, setConfig, mode }: BrickRenderProps) => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return context.bricks[config.name]
  }, [context.bricks, config])
  const keys = useMemo(() => {
    return Object.keys(brick.dataTypes)
  }, [brick])
  const [data, setData] = useState<Record<string, unknown>>(() => {
    return getData(keys, config.data ?? {}, pSupply.data ?? {}, brick.defaultData)
  })
  const handleSetData = useCallback(
    (fn: SetDataFn, options: SetDataOptions = {}): void => {
      const newData = fn(data)
      if (options.setToConfig) {
        setConfig((config) => ({
          ...config,
          data: newData,
        }))
      } else {
        setData(newData)
      }
    },
    [data]
  )
  useEffect(() => {
    const newData = getData(keys, config.data ?? {}, pSupply.data ?? {}, brick.defaultData)
    setData(newData)
  }, [pSupply, keys, config.data, config.id, brick.defaultData])
  const actions = useMemo<Actions>(() => {
    return (
      brick.actionNames?.reduce<Actions>((result, name) => {
        const functionStr = config.actions?.[name] || brick.defaultActions?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (functionStr.startsWith('{{')) {
          action = interpreteParam(functionStr, pSupply.actions || {}) as (...args: unknown[]) => void
        } else {
          action = compileAction(functionStr, handleSetData)
        }
        result[name] = action
        return result
      }, {}) || {}
    )
  }, [config.actions, pSupply.actions])
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const dataKeys = Object.keys(supplyData)
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string') {
        value = interpreteParam(value, {
          supply: pSupply.data,
          data,
        })
      }
      result[key] = value
      return result
    }, {})
    if (config.id && dataKeys.length > 0) {
      supplyData = {
        [`${idPrefix}${config.id}`]: supplyData,
      }
    }
    return supplyData
  }, [config.supply?.data, config.id, pSupply, data])
  const supplyActions = useMemo(() => {
    let supplyActions = {
      ...compileActions(config.supply?.actions || {}, handleSetData),
    }
    const actionKeys = Object.keys(supplyActions)
    supplyActions = actionKeys.reduce<Actions>((result, key) => {
      let value = supplyActions[key]
      if (typeof value === 'string') {
        if (value.startsWith('{{')) {
          value = interpreteParam(value, {
            supply: pSupply.actions,
            actions,
          }) as (fn: SetData) => void
        }
      }
      result[key] = value as Action
      return result
    }, {})
    if (config.id && actionKeys.length > 0) {
      supplyActions = {
        [`${idPrefix}${config.id}`]: supplyActions,
      }
    }
    return supplyActions
  }, [config.supply?.actions, config.id, pSupply, actions])
  const supply = useMemo(() => {
    return {
      data: {
        ...pSupply.data,
        ...supplyData,
      },
      actions: {
        ...pSupply.actions,
        ...supplyActions,
      },
    }
  }, [supplyData, supplyActions, pSupply])
  const handleSetStateForChildren = useCallback(
    (fn: (config: Readonly<Config>) => Config, index: number) => {
      if (!config.children || !config.children.length) {
        return
      }
      const children = config.children.slice()
      children.splice(index, 1, fn(config.children[index]))
      setConfig((config) => ({
        ...config,
        children,
      }))
    },
    [config]
  )
  return (
    <BrickWrapper config={config} onConfigChange={setConfig}>
      {context.bricks[config.name].render({
        data,
        setData: handleSetData,
        actions,
        supply: pSupply,
        children:
          Array.isArray(config.children) &&
          config.children.map((child, index) => {
            return (
              <BrickRenderer
                key={index}
                mode={mode}
                config={child}
                supply={supply}
                setConfig={(fn: SetConfigFn) => handleSetStateForChildren(fn, index)}
              />
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
