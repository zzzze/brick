import { DataObject } from './brick'

export interface Config {
  name: string
  version: string
  id?: string
  data?: DataObject
  actions?: Record<string, string>
  supply?: Record<string, unknown> // provide data for child brick
  children?: Config[]
}

export interface SetConfigFn {
  (config: Readonly<Config>): Config
}

export interface SetConfig {
  (fn: SetConfigFn): void
}
