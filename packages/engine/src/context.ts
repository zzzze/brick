import { Brick, EngineMode } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'
import { ConnectDragSource } from 'react-dnd'

export interface RenderConfigurationForm {
  (
    node: JSX.Element,
    ee: EventEmitter,
    connectDragSource: ConnectDragSource,
    removeItem: () => void
  ): JSX.Element | null
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
