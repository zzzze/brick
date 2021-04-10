import React, { useCallback, useMemo, useContext } from 'react'
import { BrickInstance, Blueprint, SetBlueprint, SetBlueprintFn, BrickContext } from './types'
import BrickWrapper, { createRemoveItemFromParentFn } from './brick-wrapper'
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
import ErrorBoundary from './error-boundary'
import { Action } from './types'

export interface BrickRenderProps {
  blueprint: Blueprint
  parentBlueprint?: Blueprint
  context: BrickContext
  setBlueprint: SetBlueprint
  onRemoveItemFromParent?: (key: string) => void
  onAddToOrMoveInParent?: (blueprint: Blueprint, anchorKey: string, action: string) => void
  onDrop?: (_blueprint: Blueprint) => void
  isRoot?: boolean
}

const BrickRenderer: React.FC<BrickRenderProps> = ({
  blueprint: blueprint,
  context,
  setBlueprint,
  ...props
}: BrickRenderProps) => {
  const engineCtx = useContext(EnginxContext)
  const brick = useMemo(() => {
    const brick = engineCtx.bricks[blueprint.name]
    if (!brick) {
      throw Error(`brick (${blueprint.name}) not found`)
    }
    return brick
  }, [engineCtx.bricks, blueprint])
  const dataTypes = useMemo(() => {
    return normalizeDataType(engineCtx.dataTypes, brick.dataTypes)
  }, [engineCtx.dataTypes, brick.dataTypes])
  const [data, setData] = useData(dataTypes, blueprint.data ?? {}, context.data ?? {})
  const instanceHandlers = useInstanceHandlers(data, setBlueprint, setData)
  const actions = useActions(blueprint, context)
  const listeners = useListeners(blueprint, context, actions)
  const handlers = useHandlers(brick, blueprint, context, actions)
  const supply = useSupply(blueprint, context, data, actions)
  const handleSetStateForChildren = useCallback((fn: (blueprint: Readonly<Blueprint>) => Blueprint, key: string) => {
    setBlueprint((blueprint) => {
      if (!blueprint.children || !blueprint.children.length) {
        return blueprint
      }
      const children = blueprint.children.map((child) => {
        if (child._key !== key) {
          return child
        } else {
          return fn({ ...child })
        }
      })
      return {
        ...blueprint,
        children,
      }
    })
  }, [])
  const handleRemoveFromParent = useCallback(
    (key: string) => {
      createRemoveItemFromParentFn(setBlueprint)(key)
    },
    [setBlueprint]
  )
  const handleAddToOrMoveInParent = useCallback((_blueprint: Blueprint, anchorKey: string, action: string) => {
    setBlueprint((blueprint) => {
      if (!blueprint.children || !blueprint.children.length) {
        return blueprint
      }
      const children = blueprint.children.filter((c) => c._key !== _blueprint._key)
      let anchorIndex = -1
      for (let i = 0; i < blueprint.children.length; i++) {
        if (blueprint.children[i]._key === anchorKey) {
          anchorIndex = i
          break
        }
      }
      if (anchorIndex === -1) {
        throw Error(`anchor node not found (key: ${anchorKey})`)
      }
      const insertIndex = action === 'forward' ? anchorIndex : anchorIndex + 1
      children.splice(insertIndex, 0, _blueprint)
      return {
        ...blueprint,
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
    key: blueprint._key,
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
    if (Object.keys(blueprint.supply?.actions || {}).length) {
      if (blueprint.id) {
        bindBrickInstance((supply.actions?.[`$${blueprint.id}`] || {}) as Record<string, Action>, brickInstance)
      } else {
        bindBrickInstance((supply.actions?.$global || {}) as Record<string, Action>, brickInstance)
      }
    }
  }, [supply.actions])
  const render = useRender(brick, blueprint)
  return (
    <BrickWrapper
      key={blueprint._key}
      onRemoveItemFormParent={props.onRemoveItemFromParent}
      onAddToOrMoveInParent={props.onAddToOrMoveInParent}
      blueprint={blueprint}
      isRoot={props.isRoot}
      parentBlueprint={props.parentBlueprint}
      onBlueprintChange={setBlueprint}>
      {render({
        ...brickInstance,
        actions,
        handlers,
        children:
          Array.isArray(blueprint.children) &&
          blueprint.children.map((child) => {
            return (
              <ErrorBoundary key={child._key}>
                <BrickRenderer
                  parentBlueprint={blueprint}
                  blueprint={child}
                  context={supply}
                  onAddToOrMoveInParent={handleAddToOrMoveInParent}
                  onRemoveItemFromParent={handleRemoveFromParent}
                  setBlueprint={(fn: SetBlueprintFn) => handleSetStateForChildren(fn, child._key)}
                />
              </ErrorBoundary>
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
