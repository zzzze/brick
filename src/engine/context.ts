import React from 'react'

export interface RenderConfigForm {
  (node: JSX.Element): JSX.Element | null
}

interface ContextType {
  renderConfigForm: RenderConfigForm
}

const Context = React.createContext<ContextType>({
  renderConfigForm: () => null,
})

export default Context
