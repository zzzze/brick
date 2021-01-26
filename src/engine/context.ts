import React from 'react'

export interface RenderConfigFormOptions {
  visible: boolean
  hide: () => void
}

export interface RenderConfigForm {
  (element: JSX.Element, options: RenderConfigFormOptions): JSX.Element | null
}

interface ContextType {
  renderConfigForm: RenderConfigForm
}

const Context = React.createContext<ContextType>({
  renderConfigForm: () => null,
})

export default Context
