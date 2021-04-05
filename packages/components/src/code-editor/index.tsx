import React, { useRef, useEffect, forwardRef, useMemo, useImperativeHandle, CSSProperties } from 'react'

interface EventData {
  target: {
    name: string
    value: string
  }
}

export interface IEditorProps {
  value?: string
  name?: string
  onChange?: (data: EventData) => void
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
  const libSource = `
    declare interface BrickContext {
      data?: Record<string, unknown>
      actions?: Record<string, unknown>
    }
    declare type DataObject = Record<string, unknown>
    declare interface SetDataFn {
      (data: DataObject): DataObject
    }
    declare interface SetData {
      (fn: SetDataFn, options: SetDataOptions): void
    }
    declare interface SetDataOptions {
      setToConfig?: boolean
    }
    declare interface SetData {
      (fn: SetDataFn, options: SetDataOptions): void
    }
    declare interface Emit {
      (event: string, ...args: unknown[]): void
    }
    declare interface BrickInstance {
      key: string
      data: DataObject
      actions: Record<string, Action>
      handlers: Record<string, Action>
      context: BrickContext
      setData: SetData
      emit: Emit
      editing: boolean
      children?: React.ReactElement
    }
  `
  const libUri = 'ts:filename/brick-instance.d.ts'
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri)
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri))
}

const Editor = forwardRef<Instance, IEditorProps>((props, ref) => {
  const divEl = useRef<HTMLDivElement>(null)
  let editor: monaco.editor.IStandaloneCodeEditor
  useEffect(() => {
    if (divEl.current) {
      initMonaco()
      editor = monaco.editor.create(divEl.current, {
        value: props.value,
        language: 'typescript',
        minimap: {
          enabled: false,
        },
      })
      editor.onDidChangeModelContent(() => {
        props.onChange &&
          props.onChange({
            target: {
              name: props.name ?? '',
              value: editor.getValue(),
            },
          })
      })
    }
    return () => {
      editor.dispose()
    }
  }, [])
  const instance = useMemo(() => {
    const obj = { value: '' }
    Object.defineProperty(obj, 'value', {
      set(newValue: string) {
        if (newValue && editor) {
          editor.setValue(newValue)
        }
      },
    })
    return obj
  }, [])
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
