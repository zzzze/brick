import { useMemo } from 'react'
import { Brick, Blueprint, Render } from './types'
import compileCustomRender from './compile-custom-render'

export default function useRender(brick: Brick, blueprint: Blueprint): Render {
  const customRender = useMemo<null | Render>(() => {
    if (!brick.canCustomizeRender || !blueprint.render) {
      return null
    }
    return compileCustomRender(blueprint.render)
  }, [blueprint.render, brick.canCustomizeRender])
  return useMemo(() => {
    if (brick.canCustomizeRender && customRender) {
      return customRender
    } else {
      return brick.render
    }
  }, [brick.render, brick.canCustomizeRender, customRender])
}
