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

export interface BrickGroupMap {
  name: string
  children?: BrickGroupMap[]
}

export interface Brick {
  name: string
  dataTypes: Record<string, string | DataTypeDefinition>
  eventNames?: string[] // events triggered by brick
  defaultHandlers?: Record<string, string> // handler for event
  childrenType: ChildrenType
  render: Render
  renderMenu?: () => React.ReactElement
  canCustomizeRender?: boolean
  version: string
}

export interface BrickGroup extends Brick {
  map: BrickGroupMap
}
