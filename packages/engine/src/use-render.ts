import { useMemo } from 'react'
import { Brick, Blueprint, Render, BrickInstance } from './types'
import compileCustomRender, { bindInstance } from './compile-custom-render'

export default function useRender(instance: BrickInstance, brick: Brick, blueprint: Blueprint): Render {
  const customRender = useMemo<null | Render>(() => {
    if (!blueprint.render) {
      return null
    }
    return compileCustomRender(instance, blueprint.render)
  }, [blueprint.render])
  return useMemo(() => {
    if (customRender) {
      return customRender
    } else {
      return bindInstance(brick.render, instance)
    }
  }, [brick.render, customRender])
}
