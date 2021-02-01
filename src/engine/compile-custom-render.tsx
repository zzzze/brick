import { CustomRender, Render, RenderArgs } from '@/types'
import { transform } from '@babel/standalone'

export default function compileCustomRender(customRender: CustomRender): Render {
  const modules = Object.keys(customRender.modules || {}).reduce<Record<string, unknown>>((result, name: string) => {
    result[name] = require(customRender.modules?.[name] || '')
    return result
  }, {})
  const React: unknown = require('react') // eslint-disable-line @typescript-eslint/no-var-requires
  void modules // cheak on compiler
  void React // cheak on compiler
  let render: Render = function () {} as any // eslint-disable-line
  let functionStr = `render = ${customRender.func}`
  functionStr =
    transform(functionStr, {
      filename: 'render.tsx',
      presets: ['env', 'react', 'typescript'],
    }).code || ''
  eval(functionStr) // TODO: compile in build mode
  return (args: RenderArgs) => {
    return render(args)
  }
}
