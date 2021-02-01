import React from 'react'
import { CustomRender, Render, RenderArgs } from '@/types'

export default function compileCustomRender(customRender: CustomRender): Render {
  const modules = Object.keys(customRender.modules || {}).reduce<Record<string, unknown>>((result, name: string) => {
    result[name] = require(customRender.modules?.[name] || '')
    return result
  }, {})
  return (args: RenderArgs) => {
    const require = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
    void modules // cheak on compiler
    void require // cheak on compiler
    void React // cheak on compiler
    let render: Render = function () {} as any // eslint-disable-line
    eval(`render = ${customRender.func}`) // TODO: compile in build mode
    return render(args)
  }
}
