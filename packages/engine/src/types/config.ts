import { Action, DataObject, Emit, SetData } from './brick'

export const idPrefix = '$'

export interface Supply {
  data?: Record<string, unknown>
  actions?: Record<string, string>
}

export interface CustomRender {
  modules?: Record<string, string>
  func: string
}

export type Func = string | ((setData: SetData, emit: Emit) => Action)

export interface Config {
  name: string // brick name
  version: string // brick version
  id?: string // brick instance id
  data?: DataObject // data for brick instance
  actions?: Record<string, Func> // define action which can be used by supply or handler
  handlers?: Record<string, Func> // define handler of event that triggered by brick instance
  supply?: Supply // provide data for child brick instance
  children?: Config[]
  listeners?: Record<string, Func> // listeners use for register event listeners of EventEmitter
  render?: CustomRender // custom render
}

export interface SetConfigFn {
  (config: Readonly<Config>): Config
}

export interface SetConfig {
  (fn: SetConfigFn): void
}