import { cloneDeep } from 'lodash'
import React, { ReactElement, useCallback } from 'react'
import BrickRenderer from './brick-renderer'
import { createRemoveItemFromParentFn } from './brick-wrapper'
import evalForExpr from './data/eval-for-expr'
import ErrorBoundary from './error-boundary'
import { Blueprint, BrickContext, BrickInstance, SetBlueprint, SetBlueprintFn } from './types'

const useRenderChildren = (
  instance: BrickInstance,
  blueprint: Blueprint,
  supply: BrickContext,
  setBlueprint: SetBlueprint
): ((item?: unknown, i?: number) => ReactElement[] | null) => {
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
  const handleRemoveFromParent = useCallback(
    (key: string) => {
      createRemoveItemFromParentFn(setBlueprint)(key)
    },
    [setBlueprint]
  )
  return useCallback(
    (item?: unknown, i?: number) => {
      const newSupply = {
        ...supply,
        data: {
          ...supply.data,
          $parent: cloneDeep(supply?.data?.$parent ?? {}),
        },
      }
      if (typeof item !== 'undefined') {
        newSupply.data.$parent = Object.keys((newSupply.data.$parent as Record<string, unknown>) ?? {}).reduce<
          Record<string, unknown>
        >((acc, cur) => {
          const value = (newSupply?.data?.$parent as Record<string, unknown>)?.[cur]
          if (typeof value === 'string' && /\b(item|index)\b/.test(value)) {
            acc[cur] = evalForExpr(value, instance.data, item, i ?? 0)
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
    [blueprint.children, supply.data]
  )
}

export default useRenderChildren
