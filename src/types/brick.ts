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

export interface SetDataFn {
  (data: DataObject): DataObject
}

export interface SetDataOptions {
  setToConfig?: boolean // whether set data into config, if false set data at runtime only
}

export interface SetData {
  (fn: SetDataFn, options: SetDataOptions): void
}

export interface RenderArgs {
  data: DataObject
  actions: Record<string, (setData: SetData) => void>
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
  actionNames?: string[]
  defaultActions?: Record<string, string>
  defaultData: DataObject
  childrenType: ChildrenType
  renderConfigForm: (args: ConfigFormRenderArgs) => React.ReactElement
  render: (args: RenderArgs) => React.ReactElement
  version: string
}
