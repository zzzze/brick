import React, { useCallback, useMemo, useEffect } from 'react'
import { Config, Brick, DataObject, EngineMode, SetConfig, SetConfigFn, SetDataFn, SetData } from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'
import { interpreteParam } from '@/utils'

interface BrickRenderProps {
  config: Config
  bricks: Record<string, Brick>
  supply: Record<string, unknown>
  mode: EngineMode
  setConfig: SetConfig
}

const BrickRenderer: React.FC<BrickRenderProps> = ({
  config,
  supply: pSupply,
  bricks,
  setConfig,
  mode,
}: BrickRenderProps) => {
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  const keys = useMemo(() => {
    return Object.keys(brick.dataTypes)
  }, [brick])
  const data = useMemo(() => {
    return keys.reduce<Record<string, unknown>>((result, key) => {
      let value = config.data?.[key]
      if (typeof value === 'string') {
        value = interpreteParam(value, pSupply)
      }
      result[key] = value
      return result
    }, {})
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
    (fn: SetDataFn): void => {
      const newData = fn(data)
      setConfig((config) => ({
        ...config,
        data: newData,
      }))
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
    <BrickWrapper config={config} bricks={bricks} onConfigChange={setConfig}>
      {bricks[config.name].render({
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
                bricks={bricks}
                setConfig={(fn: SetConfigFn) => handleSetStateForChildren(fn, index)}
              />
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
