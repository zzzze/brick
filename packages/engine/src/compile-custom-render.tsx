import { CustomRender, Render, BrickInstance } from './types'
import { transform } from '@babel/standalone'

export default function compileCustomRender(fn: CustomRender): Render {
  return (args: BrickInstance) => {
    const React: unknown = require('react') // eslint-disable-line @typescript-eslint/no-var-requires
    void React // cheak on compiler
    const BrickContainer: unknown = require('@brick/components')?.BrickContainer // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
    const components = { BrickContainer }
    let render: Render = function () {} as any // eslint-disable-line
    if (typeof fn === 'function') {
      render = fn(components)
    } else {
      fn = `render = ${fn}`
      fn =
        transform(fn, {
          filename: 'render.tsx',
          presets: ['env', 'react', 'typescript'],
        }).code || ''
      eval(fn)
    }
    return render(args)
  }
}
