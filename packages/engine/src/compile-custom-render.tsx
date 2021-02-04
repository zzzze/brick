import { Render, RenderArgs } from './types'
import { transform } from '@babel/standalone'

const webpackRequire = require

export default function compileCustomRender(customRender: string): Render {
  const React: unknown = webpackRequire('react') // eslint-disable-line @typescript-eslint/no-var-requires
  const require = webpackRequire
  void require // cheak on compiler
  void React // cheak on compiler
  let render: Render = function () {} as any // eslint-disable-line
  let functionStr = `render = ${customRender}`
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
