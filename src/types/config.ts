import { PropsObject } from './brick'

export interface Config {
  name: string
  props: PropsObject
  children?: Config[]
  version: string
}
