import { Brick, EngineMode } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'

export interface RenderConfigurationForm {
  (node: JSX.Element, ee: EventEmitter): JSX.Element | null
}

interface ContextType {
  renderConfigurationForm: RenderConfigurationForm
  bricks: Record<string, Brick>
  ee: EventEmitter
  mode: EngineMode
}

const Context = React.createContext<ContextType>({
  renderConfigurationForm: () => null,
  bricks: {},
  ee: new EventEmitter(),
  mode: EngineMode.EDIT,
})

export default Context
