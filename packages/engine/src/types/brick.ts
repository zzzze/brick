import { DataTypeDefinition } from '@/data/normalize-data-type'
import { Action } from '../action/compile-action'

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

export interface SetDataFn {
  (data: DataObject): DataObject
}

export interface SetDataOptions {
  setToConfig?: boolean // whether set data into config, if false set data at runtime only
}

export interface SetData {
  (fn: SetDataFn, options: SetDataOptions): void
}

export interface Emit {
  (event: string, ...args: unknown[]): void
}

export interface BrickContext {
  data?: Record<string, unknown>
  actions?: Record<string, unknown>
}

export interface BrickInstance {
  key: string
  data: DataObject
  actions: Record<string, Action>
  handlers: Record<string, Action>
  context: BrickContext
  setData: SetData
  emit: Emit
  children?: React.ReactNode
}

export type DataObject = Record<string, unknown>

export interface Render {
  (args: BrickInstance): React.ReactElement
}

export interface Brick {
  name: string
  icon?: string
  dataTypes: Record<string, string | DataTypeDefinition>
  eventNames?: string[] // events triggered by brick
  defaultHandlers?: Record<string, string> // handler for event
  childrenType: ChildrenType
  render: Render
  canCustomizeRender?: boolean
  version: string
}
