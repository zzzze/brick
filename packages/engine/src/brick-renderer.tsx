import React, { useCallback, useMemo, useContext } from 'react'
import { BrickInstance, Config, SetConfig, SetConfigFn, BrickContext } from './types'
import BrickWrapper from './brick-wrapper'
import EnginxContext from './context'
import useRender from './use-render'
import useActions from './action/use-actions'
import useHandlers from './action/use-handlers'
import useListeners from './action/use-listeners'
import useSupply from './action/use-supply'
import useInstanceHandlers from './use-instance-handlers'
import normalizeDataType from './data/normalize-data-type'
import useData from './data/use-data'
import bindBrickInstance from './action/bind-brick-instance'
import { Action } from './action/compile-action'

interface BrickRenderProps {
  config: Config
  parentConfig?: Config
  context: BrickContext
  setConfig: SetConfig
  onRemoveItemFromParent?: (key: string) => void
  onAddToOrMoveInParent?: (config: Config, anchorKey: string, action: string) => void
  onDrop?: (_config: Config) => void
  isRoot?: boolean
}

const BrickRenderer: React.FC<BrickRenderProps> = ({ config, context, setConfig, ...props }: BrickRenderProps) => {
  const engineCtx = useContext(EnginxContext)
  const brick = useMemo(() => {
    const brick = engineCtx.bricks[config.name]
    if (!brick) {
      throw Error(`brick (${config.name}) not found`)
    }
    return brick
  }, [engineCtx.bricks, config])
  const dataTypes = useMemo(() => {
    return normalizeDataType(engineCtx.dataTypes, brick.dataTypes)
  }, [engineCtx.dataTypes, brick.dataTypes])
  const [data, setData] = useData(dataTypes, config.data ?? {}, context.data ?? {})
  const instanceHandlers = useInstanceHandlers(data, setConfig, setData)
  const actions = useActions(config, context)
  const listeners = useListeners(config, context, actions)
  const handlers = useHandlers(brick, config, context, actions)
  const supply = useSupply(config, context, data, actions)
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
  const brickInstance: Omit<BrickInstance, 'children' | 'handlers'> = {
    ...instanceHandlers,
    data,
    context,
    actions,
    editing: !engineCtx.previewMode,
    key: config._key,
  }
  useMemo(() => {
    bindBrickInstance(actions, brickInstance)
  }, [actions])
  useMemo(() => {
    bindBrickInstance(listeners, brickInstance)
  }, [listeners])
  useMemo(() => {
    bindBrickInstance(handlers, brickInstance)
  }, [handlers])
  useMemo(() => {
    if (Object.keys(config.supply?.actions || {}).length) {
      if (config.id) {
        bindBrickInstance((supply.actions?.[`$${config.id}`] || {}) as Record<string, Action>, brickInstance)
      } else {
        bindBrickInstance((supply.actions?.$global || {}) as Record<string, Action>, brickInstance)
      }
    }
  }, [supply.actions])
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
        ...brickInstance,
        actions,
        handlers,
        children:
          Array.isArray(config.children) &&
          config.children.map((child) => {
            return (
              <BrickRenderer
                key={child._key}
                parentConfig={config}
                config={child}
                context={supply}
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
