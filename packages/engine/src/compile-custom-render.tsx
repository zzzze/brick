import { CustomRender, Render, BrickInstance } from './types'
import { transform } from '@babel/standalone'

export default function compileCustomRender(fn: CustomRender): Render {
  return (args: BrickInstance) => {
    const React: unknown = require('react') // eslint-disable-line @typescript-eslint/no-var-requires
    void React // cheak on compiler
    let render: Render = function () {} as any // eslint-disable-line
    if (typeof fn === 'function') {
      render = fn()
    } else {
      if (!fn.startsWith('render =')) {
        fn = `render = ${fn}`
      }
      try {
        fn =
          transform(fn, {
            filename: 'render.tsx',
            presets: ['env', 'react', 'typescript'],
          }).code || ''
        eval(fn)
      } catch (err) {
        render = () => <pre key="error">Error: {String(err)}</pre>
      }
    }
    return render(args)
  }
}
