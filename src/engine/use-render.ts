import { useMemo } from 'react'
import { Brick, Config, Render } from '@/types'
import compileCustomRender from './compile-custom-render'

export default function useRender(brick: Brick, config: Config): Render {
  const customRender = useMemo<null | Render>(() => {
    if (!brick.canCustomizeRender || !config.render) {
      return null
    }
    return compileCustomRender(config.render)
  }, [config.render, brick.canCustomizeRender])
  return useMemo(() => {
    if (brick.canCustomizeRender && customRender) {
      return customRender
    } else {
      return brick.render
    }
  }, [brick.render, brick.canCustomizeRender, customRender])
}
