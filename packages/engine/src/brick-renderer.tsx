import React, { useCallback, useMemo, useContext, useRef } from 'react'
import { BrickInstance, Blueprint, SetBlueprint, SetBlueprintFn, BrickContext, DataObject } from './types'
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
import ErrorBoundary from './error-boundary'
import evalForExpr from './data/eval-for-expr'
import RenderCopy, { CopyWrapper } from './render-copy'
import { cloneDeep } from 'lodash'

export interface BrickRenderProps {
  blueprint: Blueprint
  parentBlueprint?: Blueprint
  context: BrickContext
  setBlueprint: SetBlueprint
  onRemoveItemFromParent?: (key: string) => void
  onAddToOrMoveInParent?: (blueprint: Blueprint, anchorKey: string, action: string) => void
  onDrop?: (_blueprint: Blueprint) => void
  isRoot?: boolean
  data?: DataObject
  keyPrefix?: string
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
  const [data, setData] = useData(dataTypes, blueprint.data ?? {}, context.data ?? {}, props.data ?? {})
  const instanceHandlers = useInstanceHandlers(data, setBlueprint, setData)
  const instance = useRef<BrickInstance>({
    key: blueprint._key,
    context,
    listeners: {},
    actions: {},
    handlers: {},
    data,
    editing: !engineCtx.previewMode,
    ...instanceHandlers,
  })
  instance.current.context = context
  instance.current.editing = !engineCtx.previewMode
  instance.current.data = data
  Object.assign(instance.current, instanceHandlers)
  const actions = useActions(instance.current, blueprint, context)
  const listeners = useListeners(instance.current, blueprint, context, actions)
  const handlers = useHandlers(instance.current, brick, blueprint, context, actions)
  const supply = useSupply(instance.current, blueprint, context, data, actions)
  instance.current.listeners = listeners
  instance.current.actions = actions
  instance.current.handlers = handlers
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
  const render = useRender(brick, blueprint)
  if (engineCtx.previewMode && !(data?.if ?? true)) {
    return null
  }
  const renderChildren = useCallback(
    (item?: unknown, i?: number) => {
      const newSupply = cloneDeep(supply)
      if (typeof item !== 'undefined' && newSupply?.data?.$parent) {
        newSupply.data.$parent = Object.keys((newSupply?.data?.$parent as Record<string, unknown>) ?? {}).reduce<
          Record<string, unknown>
        >((acc, cur) => {
          const value = (newSupply?.data?.$parent as Record<string, unknown>)?.[cur]
          if (typeof value === 'string' && /\b(item|index)\b/.test(value)) {
            acc[cur] = evalForExpr(value, instance.current.data, item, i ?? 0)
          } else {
            acc[cur] = value
          }
          return acc
        }, {})
      }
      if (!Array.isArray(blueprint.children)) return null
      return blueprint.children.map((child) => {
        const newChild = { ...child }
        if (typeof i !== 'undefined') {
          newChild.copy = true
          newChild.copyID = i
        }
        return (
          <ErrorBoundary key={child._key}>
            <BrickRenderer
              parentBlueprint={blueprint}
              blueprint={newChild}
              context={newSupply}
              onAddToOrMoveInParent={handleAddToOrMoveInParent}
              onRemoveItemFromParent={handleRemoveFromParent}
              setBlueprint={(fn: SetBlueprintFn) => handleSetStateForChildren(fn, newChild._key)}
            />
          </ErrorBoundary>
        )
      })
    },
    [blueprint.children, supply.data, props.keyPrefix, data]
  )
  return (
    <BrickWrapper
      hidden={!((data?.if as boolean) ?? true)}
      key={blueprint._key}
      onRemoveItemFormParent={props.onRemoveItemFromParent}
      onAddToOrMoveInParent={props.onAddToOrMoveInParent}
      blueprint={blueprint}
      isRoot={props.isRoot}
      parentBlueprint={props.parentBlueprint}
      onBlueprintChange={setBlueprint}>
      {Array.isArray(data.for) ? (
        <CopyWrapper>
          {data.for.map((item, i) => {
            const instanceCopied = { ...instance.current }
            instanceCopied.data = Object.keys(instanceCopied.data).reduce<Record<string, unknown>>((acc, cur) => {
              const value = instanceCopied.data[cur]
              if (typeof value === 'string' && /\b(item|index)\b/.test(value)) {
                acc[cur] = evalForExpr(value, instanceCopied.data, item, i)
              } else {
                acc[cur] = value
              }
              return acc
            }, {})
            return (
              <RenderCopy
                key={i}
                render={render}
                options={{ ...instanceCopied, actions, handlers, children: renderChildren(item, i) }}
              />
            )
          })}
        </CopyWrapper>
      ) : (
        render({
          ...instance.current,
          children: renderChildren(),
        })
      )}
    </BrickWrapper>
  )
}

export default BrickRenderer
