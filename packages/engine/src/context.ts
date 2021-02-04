import { Brick } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'

export interface RenderConfigForm {
  (node: JSX.Element): JSX.Element | null
}

interface ContextType {
  renderConfigForm: RenderConfigForm
  bricks: Record<string, Brick>
  ee: EventEmitter
}

const Context = React.createContext<ContextType>({
  renderConfigForm: () => null,
  bricks: {},
  ee: new EventEmitter(),
})

export default Context
