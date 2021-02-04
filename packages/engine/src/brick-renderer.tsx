import React, { useCallback, useMemo, useEffect, useState, useContext } from 'react'
import { Config, EngineMode, SetConfig, SetConfigFn, SupplyInRender } from '@/types'
import BrickWrapper from '@/brick-wrapper'
import Context from '@/context'
import getConfigData from '@/get-config-data'
import useRender from '@/use-render'
import useActions from '@/use-actions'
import useHandlers from '@/use-handlers'
import useListeners from '@/use-listeners'
import useSupply from '@/use-supply'
import useHandlersUseInRender from '@/use-handlers-use-in-render'

interface BrickRenderProps {
  config: Config
  supply: SupplyInRender
  mode: EngineMode
  setConfig: SetConfig
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
  const handlersUseInRender = useHandlersUseInRender(data, setConfig, setData)
  useEffect(() => {
    const newData = getConfigData(keys, config.data ?? {}, pSupply.data ?? {}, brick.defaultData)
    setData(newData)
  }, [pSupply, keys, config.data, config.id, brick.defaultData])
  const actions = useActions(config, pSupply, handlersUseInRender)
  const handlers = useHandlers(brick, actions, config, pSupply, handlersUseInRender)
  useListeners(actions, config, pSupply, handlersUseInRender)
  const supply = useSupply(config, pSupply, data, actions, handlersUseInRender)
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
  const render = useRender(brick, config)
  return (
    <BrickWrapper config={config} onConfigChange={setConfig}>
      {render({
        data,
        setData: handlersUseInRender.setData,
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
