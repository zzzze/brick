import { DataObject } from './brick'

export const idPrefix = '$$'

export interface Supply {
  data?: Record<string, unknown>
  actions?: Record<string, string>
}

export interface Config {
  name: string
  version: string
  id?: string
  data?: DataObject
  actions?: Record<string, string> // define action which can be used by supply or handler
  handlers?: Record<string, string>
  supply?: Supply // provide data for child brick
  children?: Config[]
}

export interface SetConfigFn {
  (config: Readonly<Config>): Config
}

export interface SetConfig {
  (fn: SetConfigFn): void
}
