import React, { useCallback, useMemo, useEffect, useState, useContext } from 'react'
import { Config, SetConfig, SetConfigFn, SupplyInRender } from './types'
import BrickWrapper from './brick-wrapper'
import Context from './context'
import getConfigData from './get-config-data'
import useRender from './use-render'
import useActions from './use-actions'
import useHandlers from './use-handlers'
import useListeners from './use-listeners'
import useSupply from './use-supply'
import useHandlersUseInRender from './use-handlers-use-in-render'

interface BrickRenderProps {
  config: Config
  parentConfig?: Config
  supply: SupplyInRender
  setConfig: SetConfig
  onRemoveItemFromParent?: (key: string) => void
  onAddToOrMoveInParent?: (config: Config, anchorKey: string, action: string) => void
  onDrop?: (_config: Config) => void
  isRoot?: boolean
}

const BrickRenderer: React.FC<BrickRenderProps> = ({
  config,
  supply: pSupply,
  setConfig,
  ...props
}: BrickRenderProps) => {
  const context = useContext(Context)
  useEffect(() => {
    if (!context.autoCommit) {
      context.transactionBegin()
    }
  })
  useEffect(() => {
    if (context.autoCommit) {
      context.transactionCommit()
    }
  }, [context.autoCommit])
  const brick = useMemo(() => {
    const brick = context.bricks[config.name]
    if (!brick) {
      throw Error(`brick (${config.name}) not found`)
    }
    return brick
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
  const handleSetStateForChildren = useCallback((fn: (config: Readonly<Config>) => Config, key: string) => {
    setConfig((config) => {
      if (!config.children || !config.children.length) {
        return config
      }
      const children = config.children.map((child) => {
        if (child._key !== key) {
          return child
        } else {
          return fn({ ...child })
        }
      })
      return {
        ...config,
        children,
      }
    })
  }, [])
  const handleRemoveFromParent = useCallback((key: string) => {
    setConfig((config) => {
      if (!config.children || !config.children.length) {
        return config
      }
      const children = config.children.filter((item) => item._key !== key)
      return {
        ...config,
        children,
      }
    })
  }, [])
  const handleDrop = useCallback((_config: Config) => {
    setConfig((config) => {
      let children: Config[] = []
      if (config.children && config.children.length) {
        children = config.children.slice()
      }
      children.push({
        ..._config,
      })
      return {
        ...config,
        children,
      }
    })
  }, [])
  const handleAddToOrMoveInParent = useCallback((_config: Config, anchorKey: string, action: string) => {
    setConfig((config) => {
      if (!config.children || !config.children.length) {
        return config
      }
      const children = config.children.filter((c) => c._key !== _config._key)
      let anchorIndex = -1
      for (let i = 0; i < config.children.length; i++) {
        if (config.children[i]._key === anchorKey) {
          anchorIndex = i
          break
        }
      }
      if (anchorIndex === -1) {
        throw Error(`anchor node not found (key: ${anchorKey})`)
      }
      const insertIndex = action === 'forward' ? anchorIndex : anchorIndex + 1
      children.splice(insertIndex, 0, _config)
      return {
        ...config,
        children,
      }
    })
  }, [])
  const render = useRender(brick, config)
  return (
    <BrickWrapper
      key={config._key}
      onRemoveChild={handleRemoveFromParent}
      onRemoveItemFormParent={props.onRemoveItemFromParent}
      onAddToOrMoveInParent={props.onAddToOrMoveInParent}
      onDrop={handleDrop}
      config={config}
      isRoot={props.isRoot}
      parentConfig={props.parentConfig}
      onConfigChange={setConfig}>
      {render({
        data,
        setData: handlersUseInRender.setData,
        actions,
        handlers,
        supply: pSupply,
        children:
          Array.isArray(config.children) &&
          config.children.map((child) => {
            return (
              <BrickRenderer
                key={child._key}
                parentConfig={config}
                config={child}
                supply={supply}
                onAddToOrMoveInParent={handleAddToOrMoveInParent}
                onRemoveItemFromParent={handleRemoveFromParent}
                setConfig={(fn: SetConfigFn) => handleSetStateForChildren(fn, child._key)}
              />
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
