import { Brick, Blueprint } from './types'
import React, { createRef, ReactElement, ReactPortal, RefObject } from 'react'
import EventEmitter from 'eventemitter3'
import { ConnectDragSource } from 'react-dnd'
import { DataType } from './data/data-type'
import { EngineOptions } from './engine'

export interface RenderConfigurationFormOptions {
  connectDragSource: ConnectDragSource
  removeItem: () => void
  blueprint: Blueprint
  classes: {
    container: string
    btnGroup: string
  }
}

export interface RenderConfigurationForm {
  (node: JSX.Element, options: RenderConfigurationFormOptions): ReactElement | ReactPortal | null
}

export interface ContextType {
  renderConfigurationForm: RenderConfigurationForm
  configurationFormContainerRef: RefObject<HTMLElement>
  bricks: Record<string, Brick>
  options: EngineOptions
  dataTypes: Record<string, DataType>
  ee: EventEmitter
  previewMode: boolean
  transactionBegin: () => void
  transactionCommit: () => void
  transactionRollback: () => void
  autoCommit: boolean
  registerBrick: (brick: Brick) => void
  selectInstance: (key: string | null) => void
  selectedInstance: string | null
  getConfigurationPanelContainer: () => HTMLElement | null
}

const EnginxContext = React.createContext<ContextType>({
  options: {} as EngineOptions,
  renderConfigurationForm: () => null,
  configurationFormContainerRef: createRef(),
  bricks: {},
  dataTypes: {},
  ee: new EventEmitter(),
  previewMode: false,
  transactionBegin: () => {}, // eslint-disable-line  @typescript-eslint/no-empty-function
  transactionCommit: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  transactionRollback: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  autoCommit: false,
  registerBrick: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  selectInstance: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  selectedInstance: null,
  getConfigurationPanelContainer: () => null,
})

export default EnginxContext
