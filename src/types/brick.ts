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

export interface RenderArgs {
  value: DataObject
  children?: React.ReactNode
}

export interface ConfigFormRenderArgs {
  value: DataObject
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
  defaultData: DataObject
  childrenType: ChildrenType
  renderConfigForm: (args: ConfigFormRenderArgs) => React.ReactElement
  render: (args: RenderArgs) => React.ReactElement
  version: string
}
