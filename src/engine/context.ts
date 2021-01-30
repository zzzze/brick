import { Brick } from '@/types'
import React from 'react'

export interface RenderConfigForm {
  (node: JSX.Element): JSX.Element | null
}

interface ContextType {
  renderConfigForm: RenderConfigForm
  bricks: Record<string, Brick>
}

const Context = React.createContext<ContextType>({
  renderConfigForm: () => null,
  bricks: {},
})

export default Context
