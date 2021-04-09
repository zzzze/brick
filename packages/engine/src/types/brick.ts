import { DataTypeDefinition } from '@/data/normalize-data-type'
import { BrickInstance } from './brick-instance'

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

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
