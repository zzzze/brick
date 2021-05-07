import { useMemo } from 'react'
import { Brick, Blueprint, Render, BrickInstance } from './types'
import compileCustomRender, { bindInstance } from './compile-custom-render'

export default function useRender(instance: BrickInstance, brick: Brick, blueprint: Blueprint): Render {
  const customRender = useMemo<null | Render>(() => {
    if (!brick.canCustomizeRender || !blueprint.render) {
      return null
    }
    return compileCustomRender(instance, blueprint.render)
  }, [blueprint.render, brick.canCustomizeRender])
  return useMemo(() => {
    if (brick.canCustomizeRender && customRender) {
      return customRender
    } else {
      return bindInstance(brick.render, instance)
    }
  }, [brick.render, brick.canCustomizeRender, customRender])
}
