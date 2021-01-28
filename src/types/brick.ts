export enum PropType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

export interface RenderProps {
  value: PropsObject
  children?: React.ReactNode
}

export interface ConfigFormRenderProps {
  value: PropsObject
  onChange: (value: PropsObject) => void
  configFormVisible?: boolean
  hideConfigForm?: () => void
  children?: React.ReactNode
}

export type PropsObject = Record<string, unknown>

export interface Brick {
  name: string
  icon?: string
  propTypes: Record<string, PropType>
  defaultProps: PropsObject
  childrenType: ChildrenType
  renderConfigForm: (props: ConfigFormRenderProps) => React.ReactElement
  render: (props: RenderProps) => React.ReactElement
  version: string
}
