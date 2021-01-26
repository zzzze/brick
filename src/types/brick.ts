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

interface RenderProps {
  value: PropsObject
  children?: JSX.Element | JSX.Element[]
}

interface ConfigFormRenderProps {
  value: PropsObject
  onChange: (value: PropsObject) => void
  configFormVisible?: boolean
  hideConfigForm?: () => void
  children?: JSX.Element | JSX.Element[]
}

export type PropsObject = Record<string, unknown>

export interface Brick {
  name: string
  icon: string
  propTypes: Record<string, PropType>
  defaultProps: PropsObject
  childrenType: ChildrenType
  renderConfigForm: React.FC<ConfigFormRenderProps> | React.ComponentType<ConfigFormRenderProps>
  render: React.FC<RenderProps> | React.ComponentType<RenderProps>
  version: string
}
