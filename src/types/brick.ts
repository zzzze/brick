export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

export interface Action {
  (...args: unknown[]): void
}

export type Actions = Record<string, Action>

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

export interface SupplyInRender {
  data?: Record<string, unknown>
  actions?: Record<string, unknown>
}

export interface RenderArgs {
  data: DataObject
  actions: Record<string, Action>
  handlers: Record<string, Action>
  supply: SupplyInRender
  setData: SetData
  children?: React.ReactNode
}

export interface ConfigFormRenderArgs {
  data: DataObject
  onChange: (value: DataObject) => void
  configFormVisible?: boolean
  hideConfigForm?: () => void
  children?: React.ReactNode
}

export type DataObject = Record<string, unknown>

export interface Brick {
  name: string
  icon?: string
  dataTypes: Record<string, DataType>
  eventNames?: string[] // events triggered by brick
  defaultHandlers?: Record<string, string> // handler for event
  defaultData: DataObject
  childrenType: ChildrenType
  renderConfigForm: (args: ConfigFormRenderArgs) => React.ReactElement
  render: (args: RenderArgs) => React.ReactElement
  version: string
}