import { CustomRender, Render, BrickInstance, RenderRaw } from './types'
import { transform } from '@babel/standalone'

function customRenderIsString(fn: CustomRender): fn is string {
  return typeof fn === 'string'
}

export function bindInstance(render: RenderRaw, instance: BrickInstance, source?: string): Render {
  const newRender = render.bind(instance) as Render
  if (source) {
    newRender.__source = source
  }
  newRender.__raw = render
  newRender.rebind = function (this: Render, instance: BrickInstance): Render {
    return bindInstance(this.__raw as RenderRaw, instance, this.__source)
  }.bind(newRender)
  return newRender
}

export default function compileCustomRender(instance: BrickInstance, fn: CustomRender): Render {
  let fnStr = ''
  const render: RenderRaw = function (this: typeof instance) {
    const React: unknown = require('react') // eslint-disable-line @typescript-eslint/no-var-requires
    void React // cheak on compiler
    let _render: RenderRaw = function () {} as any // eslint-disable-line
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
    _render = _render.bind(this)
    return _render()
  }
  const newRender = bindInstance(render, instance, fnStr)
  return newRender
}
