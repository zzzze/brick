import { Brick, Blueprint } from './types'
import React from 'react'
import EventEmitter from 'eventemitter3'
import { ConnectDragSource } from 'react-dnd'
import { DataType } from './data/data-type'

export interface RenderConfigurationFormOptions {
  ee: EventEmitter
  connectDragSource: ConnectDragSource
  removeItem: () => void
  blueprint: Blueprint
}

export interface RenderConfigurationForm {
  (node: JSX.Element, options: RenderConfigurationFormOptions): JSX.Element | null
}

interface ContextType {
  renderConfigurationForm: RenderConfigurationForm
  bricks: Record<string, Brick>
  dataTypes: Record<string, DataType>
  ee: EventEmitter
  previewMode: boolean
  transactionBegin: () => void
  transactionCommit: () => void
  transactionRollback: () => void
  autoCommit: boolean
  registerBrick: (brick: Brick) => void
}

const EnginxContext = React.createContext<ContextType>({
  renderConfigurationForm: () => null,
  bricks: {},
  dataTypes: {},
  ee: new EventEmitter(),
  previewMode: false,
  transactionBegin: () => {}, // eslint-disable-line  @typescript-eslint/no-empty-function
  transactionCommit: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  transactionRollback: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  autoCommit: false,
  registerBrick: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
})

export default EnginxContext
