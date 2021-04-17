import { Func } from '@/action/compile-action'
import { Render } from './brick'
import { DataObject } from './brick-instance'

export const idPrefix = '$'

export interface Supply {
  data?: Record<string, unknown>
  actions?: Record<string, string>
}

export interface CustomRenderFn {
  (): Render
}

export type CustomRender = string | CustomRenderFn

export interface Blueprint {
  _key: string
  name: string // brick name
  version: string // brick version
  id?: string // brick instance id
  data?: DataObject // data for brick instance
  actions?: Record<string, Func> // define action which can be used by supply or handler
  handlers?: Record<string, Func> // define handler of event that triggered by brick instance
  supply?: Supply // provide data for child brick instance
  children?: Blueprint[]
  listeners?: Record<string, Func> // listeners use for register event listeners of EventEmitter
  render?: CustomRender // custom render
}

export interface SetBlueprintFn {
  (config: Readonly<Blueprint>): Blueprint
}

export interface SetBlueprint {
  (fn: SetBlueprintFn, cb?: () => void): void
}
