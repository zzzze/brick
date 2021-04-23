export * from './form'

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
