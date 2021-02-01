import React, { useCallback, useMemo, useEffect, useState, useContext } from 'react'
import {
  Config,
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
  VALUE_PARAM_PATTERN,
  Emit,
} from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'
import { interpreteParam } from '@/utils'
import Context from '@/engine/context'
import getConfigData from '@/engine/get-config-data'

interface BrickRenderProps {
  config: Config
  supply: SupplyInRender
  mode: EngineMode
  setConfig: SetConfig
}

function compileAction(fn: string, setData: SetData, emit: Emit): Action {
  return (...args: unknown[]) => {
    void setData // cheak on compiler
    void emit // cheak on compiler
    let action: (...args: unknown[]) => void = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
    eval(`action = ${fn}`) // TODO: compile in build mode
    return action(...args)
  }
}

function compileActions(actions: Record<string, unknown>, setData: SetData, emit: Emit): Record<string, unknown> {
  return Object.keys(actions).reduce<Record<string, unknown>>((result, key) => {
    const value = actions[key]
    if (typeof value === 'string' && !value.startsWith('{{')) {
      result[key] = compileAction(value, setData, emit)
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
    return getConfigData(keys, config.data ?? {}, pSupply.data ?? {}, brick.defaultData)
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
  const handleEmit = useCallback((event: string, ...args: unknown[]) => {
    context.ee.emit(event, ...args)
  }, [])
  useEffect(() => {
    const newData = getConfigData(keys, config.data ?? {}, pSupply.data ?? {}, brick.defaultData)
    setData(newData)
  }, [pSupply, keys, config.data, config.id, brick.defaultData])
  const actions = useMemo<Actions>(() => {
    return Object.keys(config.actions || {}).reduce<Actions>((result, key) => {
      const functionStr = config.actions?.[key] || 'function(){}'
      let action: (...args: unknown[]) => void
      if (VALUE_PARAM_PATTERN.test(functionStr)) {
        action = interpreteParam(functionStr, {
          $supply: pSupply.actions || {},
        }) as (...args: unknown[]) => void
      } else {
        action = compileAction(functionStr, handleSetData, handleEmit)
      }
      result[key] = action
      return result
    }, {})
  }, [config.actions, pSupply])
  const handlers = useMemo<Actions>(() => {
    return (
      brick.eventNames?.reduce<Actions>((result, name) => {
        const functionStr = config.handlers?.[name] || brick.defaultHandlers?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (VALUE_PARAM_PATTERN.test(functionStr)) {
          action = interpreteParam(functionStr, {
            $supply: pSupply.actions || {},
            $this: actions,
          }) as (...args: unknown[]) => void
        } else {
          action = compileAction(functionStr, handleSetData, handleEmit)
        }
        result[name] = action
        return result
      }, {}) || {}
    )
  }, [config.handlers, pSupply.actions, actions])
  const listeners = useMemo<Actions>(() => {
    return (
      Object.keys(config.listeners || {}).reduce<Actions>((result, name) => {
        const functionStr = config.listeners?.[name] || 'function(){}'
        let action: (...args: unknown[]) => void
        if (VALUE_PARAM_PATTERN.test(functionStr)) {
          action = interpreteParam(functionStr, {
            $supply: pSupply.actions || {},
            $this: actions,
          }) as (...args: unknown[]) => void
        } else {
          action = compileAction(functionStr, handleSetData, handleEmit)
        }
        result[name] = action
        return result
      }, {}) || {}
    )
  }, [config.listeners, pSupply.actions, actions])
  useEffect(() => {
    const _listeners = Object.keys(listeners || {}).map((key) => {
      context.ee.on(key, listeners[key])
      return () => context.ee.off(key, listeners[key])
    })
    return () => {
      _listeners.map((func) => func())
    }
  }, [listeners])
  const supplyData = useMemo(() => {
    let supplyData = {
      ...config.supply?.data,
    }
    const dataKeys = Object.keys(supplyData)
    supplyData = dataKeys.reduce<Record<string, unknown>>((result, key) => {
      let value = supplyData[key]
      if (typeof value === 'string') {
        value = interpreteParam(value, {
          $supply: pSupply.data,
          $this: data,
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
      ...compileActions(config.supply?.actions || {}, handleSetData, handleEmit),
    }
    const actionKeys = Object.keys(supplyActions)
    supplyActions = actionKeys.reduce<Actions>((result, key) => {
      let value = supplyActions[key]
      if (typeof value === 'string') {
        if (VALUE_PARAM_PATTERN.test(value)) {
          value = interpreteParam(value, {
            $supply: pSupply.actions,
            $this: actions,
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
        handlers,
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
