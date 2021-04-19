import { DataTypeDefinition } from '@/data/normalize-data-type'
import { CustomRender } from './blueprint'
import { BrickInstance, DataObject } from './brick-instance'

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

export interface Render {
  (args: BrickInstance): React.ReactElement
  __source?: string
}

export interface BrickGroupMap {
  name: string
  data?: DataObject
  render?: CustomRender
  children?: BrickGroupMap[]
}

export function isBrickGroup(brick: Brick): brick is BrickGroup {
  return typeof (brick as BrickGroup).map === 'object'
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
