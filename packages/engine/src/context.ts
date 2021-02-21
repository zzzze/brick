import { Brick, EngineMode } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'

export interface RenderConfigForm {
  (node: JSX.Element, ee: EventEmitter): JSX.Element | null
}

interface ContextType {
  renderConfigForm: RenderConfigForm
  bricks: Record<string, Brick>
  ee: EventEmitter
  mode: EngineMode
}

const Context = React.createContext<ContextType>({
  renderConfigForm: () => null,
  bricks: {},
  ee: new EventEmitter(),
  mode: EngineMode.EDIT,
})

export default Context
