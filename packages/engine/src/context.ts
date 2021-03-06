import { Brick, EngineMode } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'
import { ConnectDragSource } from 'react-dnd'

export interface RenderConfigurationFormOptions {
  ee: EventEmitter
  connectDragSource: ConnectDragSource
  removeItem: () => void
}

export interface RenderConfigurationForm {
  (node: JSX.Element, options: RenderConfigurationFormOptions): JSX.Element | null
}

interface ContextType {
  renderConfigurationForm: RenderConfigurationForm
  bricks: Record<string, Brick>
  ee: EventEmitter
  mode: EngineMode
  transactionBegin: () => void
  transactionCommit: () => void
  autoCommit: boolean
}

const Context = React.createContext<ContextType>({
  renderConfigurationForm: () => null,
  bricks: {},
  ee: new EventEmitter(),
  mode: EngineMode.EDIT,
  transactionBegin: () => {}, // eslint-disable-line  @typescript-eslint/no-empty-function
  transactionCommit: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  autoCommit: false,
})

export default Context
