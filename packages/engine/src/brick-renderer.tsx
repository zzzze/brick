import React, { useMemo, useContext, useRef } from 'react'
import { BrickInstance, Blueprint, SetBlueprint, BrickContext, DataObject } from './types'
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
import evalForExpr from './data/eval-for-expr'
import RenderCopy, { CopyWrapper } from './render-copy'
import useRenderChildren from './use-render-children'

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

  // #region setup instance
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
  const renderChildren = useRenderChildren(instance.current, blueprint, supply, setBlueprint)
  instance.current.children = renderChildren()
  // #endregion

  // #region render
  const render = useRender(instance.current, brick, blueprint)
  if (engineCtx.previewMode && !(data?.if ?? true)) {
    return null
  }
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
            instanceCopied.children = renderChildren(item, i)
            return <RenderCopy key={i} render={render.rebind(instanceCopied)} />
          })}
        </CopyWrapper>
      ) : (
        render()
      )}
    </BrickWrapper>
  )
  // #endregion
}

export default BrickRenderer
