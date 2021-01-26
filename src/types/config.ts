import {PropsObject} from "./brick"

export enum NodeName {
  ROOT = 'root',
}

export interface Config {
  name: NodeName | string
  props: PropsObject
  children: Config[]
  version: string
}
