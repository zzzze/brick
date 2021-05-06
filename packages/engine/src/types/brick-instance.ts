export interface SetDataFn {
  (data: DataObject): DataObject
}

export interface SetDataOptions {
  setToBlueprint?: boolean // whether set data into blueprint, if false set data at runtime only
}

export interface SetData {
  (fn: SetDataFn, options: SetDataOptions): void
}

export interface BrickContext {
  data?: Record<string, unknown>
  actions?: Record<string, unknown>
}

export interface Action {
  (...args: unknown[]): void
  __source?: string
  __originAction?: Action
  binded?: boolean
  instance_key?: string
}

export type DataObject = Record<string, unknown>

export interface Emit {
  (event: string, ...args: unknown[]): void
}

export interface BrickInstance {
  key: string
  data: DataObject
  actions: Record<string, Action>
  handlers: Record<string, Action>
  listeners: Record<string, Action>
  context: BrickContext
  setData: SetData
  emit: Emit
  editing?: boolean
  children?: React.ReactNode
}
