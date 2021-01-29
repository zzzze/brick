import { PropsObject } from './brick'

export interface Config {
  name: string
  version: string
  id?: string
  props?: PropsObject
  supply?: Record<string, unknown> // provide data for child brick
  children?: Config[]
}

export interface SetConfigFn {
  (config: Readonly<Config>): Config
}

export interface SetConfig {
  (fn: SetConfigFn): void
}
