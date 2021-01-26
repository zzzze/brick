import {PropsObject} from "@/interfaces/brick";

export enum NodeName {
  ROOT = 'root',
}

export default interface Config {
  name: NodeName | string
  props: PropsObject
  children: Config[]
  version: string
}
