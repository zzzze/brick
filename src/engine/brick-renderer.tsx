import React, { useCallback, useMemo, useEffect, useState, useContext } from 'react'
import { Config, DataObject, EngineMode, SetConfig, SetConfigFn, SetDataFn, SetData, SetDataOptions } from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'
import { interpreteParam } from '@/utils'
import Context from '@/engine/context'

interface BrickRenderProps {
  config: Config
  supply: Record<string, unknown>
  mode: EngineMode
  setConfig: SetConfig
}

function getData(keys: string[], config: Config, pSupply: Record<string, unknown>): Record<string, unknown> {
  return keys.reduce<Record<string, unknown>>((result, key) => {
    let value = config.data?.[key]
    if (typeof value === 'string') {
      value = interpreteParam(value, pSupply)
    }
    result[key] = value
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
    return getData(keys, config, pSupply)
  })
  useEffect(() => {
    const newData = getData(keys, config, pSupply)
    setData(newData)
  }, [pSupply, keys, config.data])
  const supply = useMemo(() => {
    let supply = config.supply ?? {}
    const keys = Object.keys(supply)
    supply = keys.reduce<Record<string, unknown>>((result, key) => {
      let value = supply[key]
      if (typeof value === 'string') {
        value = interpreteParam(value, {
          supply: pSupply,
          data,
        })
      }
      result[key] = value
      return result
    }, {})
    if (config.id && keys.length > 0) {
      supply = {
        [config.id]: supply,
      }
    }
    return {
      ...pSupply,
      ...supply,
    }
  }, [config.supply, config.id, pSupply, data])
  useEffect(() => {
    setConfig((config) => {
      const values: DataObject = {}
      keys.forEach((key) => {
        values[key] =
          !config.data || typeof config?.data[key] === 'undefined' ? brick.defaultData[key] : config.data[key]
      })
      return {
        ...config,
        data: values,
      }
    })
  }, [])
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
  const actions = useMemo<Record<string, (setData: SetData) => void>>(() => {
    return (
      brick.actionNames?.reduce<Record<string, (setData: SetData) => void>>((result, name) => {
        let action = () => {} // eslint-disable-line prefer-const, @typescript-eslint/no-empty-function
        const functionStr = config.actions?.[name] || brick.defaultActions?.[name] || 'function(){}'
        eval(`action = ${functionStr}`) // TODO: compile in build mode
        result[name] = action
        return result
      }, {}) || {}
    )
  }, [config.actions])
  return (
    <BrickWrapper config={config} onConfigChange={setConfig}>
      {context.bricks[config.name].render({
        data,
        setData: handleSetData,
        actions,
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
