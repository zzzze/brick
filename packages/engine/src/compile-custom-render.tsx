import { CustomRender, Render, BrickInstance } from './types'
import { transform } from '@babel/standalone'

function customRenderIsString(fn: CustomRender): fn is string {
  return typeof fn === 'string'
}

export default function compileCustomRender(fn: CustomRender): Render {
  let fnStr = ''
  const render: Render = (instance: BrickInstance) => {
    const React: unknown = require('react') // eslint-disable-line @typescript-eslint/no-var-requires
    void React // cheak on compiler
    let _render: Render = function () {} as any // eslint-disable-line
    if (!customRenderIsString(fn)) {
      _render = fn()
    } else {
      fnStr = fn
      if (!fn.startsWith('_render =')) {
        fn = `_render = ${fn}`
      }
      try {
        fn =
          transform(fn, {
            filename: 'render.tsx',
            presets: ['env', 'react', 'typescript'],
          }).code || ''
        eval(fn)
      } catch (err) {
        _render = () => <pre key="error">Error: {String(err)}</pre>
      }
    }
    return _render(instance)
  }
  if (fnStr) {
    render.__source = fnStr
  }
  return render
}
