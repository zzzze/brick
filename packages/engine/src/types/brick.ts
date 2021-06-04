import { DataTypeDefinition } from '@/data/normalize-data-type'
import { CustomRender } from './blueprint'
import { BrickInstance, DataObject } from './brick-instance'

export enum ChildrenType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  NONE = 'none',
}

export enum BrickStyle {
  INLINE = 'inline',
  BLOCK = 'block',
}

export interface Render extends RenderRaw {
  __raw: (instance: BrickInstance) => React.ReactElement
  rebind(instance: BrickInstance): Render
}

export interface RenderRaw {
  (): React.ReactElement
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
  style?: BrickStyle
  defaultHandlers?: Record<string, string> // handler for event
  childrenType: ChildrenType
  render: RenderRaw
  renderMenu?: () => React.ReactElement
  configurationForms?: string[]
  version: string
}

export interface BrickGroup extends Brick {
  map: BrickGroupMap
}
