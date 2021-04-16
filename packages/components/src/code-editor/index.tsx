import React, { useRef, useEffect, forwardRef, useMemo, useImperativeHandle, CSSProperties, useState } from 'react'
import { EventData } from '@brick/shared/types/form'

export interface IEditorProps {
  value?: string
  name?: string
  onChange?: (data: EventData<string>) => void
  style?: CSSProperties
  className?: string
}

export interface Instance {
  value: string
}

let inited = false
function initMonaco() {
  if (inited) {
    return
  }
  inited = true
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true, // This line disables errors in jsx tags like <div>, etc.
  })
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    allowNonTsExtensions: true,
    allowJs: true,
    target: monaco.languages.typescript.ScriptTarget.Latest,
  })

  // extra libraries
  const libSource = window.__BRICK_INSTANCE_TYPES__
  const libUri = 'ts:filename/brick-instance.d.ts'
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri)
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri))
}

const Editor = forwardRef<Instance, IEditorProps>((props, ref) => {
  const divEl = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  useEffect(() => {
    if (divEl.current) {
      initMonaco()
      const _editor = monaco.editor.create(divEl.current, {
        value: props.value,
        language: 'typescript',
        tabSize: 2,
        minimap: {
          enabled: false,
        },
      })
      _editor.onDidChangeModelContent(() => {
        props.onChange &&
          props.onChange({
            target: {
              name: props.name ?? '',
              value: _editor?.getValue() ?? '',
            },
          })
      })
      setEditor(_editor)
    }
    return () => {
      editor?.dispose()
    }
  }, [])
  useEffect(() => {
    if (editor && props.style?.display != 'none') {
      editor?.layout()
    }
  }, [editor, props.style?.display])
  const instance = useMemo(() => {
    const obj = { value: '' }
    if (!editor) {
      return obj
    }
    Object.defineProperty(obj, 'value', {
      set(newValue: string) {
        if (newValue && editor) {
          editor.setValue(newValue)
        }
      },
    })
    return obj
  }, [editor])
  useImperativeHandle(ref, () => instance)
  return (
    <div
      style={{ border: 'solid 1px #ccc', borderRadius: 5, ...props.style }}
      className={props.className}
      ref={divEl}
    />
  )
})

export { Editor }
