export interface EventData<T> {
  target: {
    name: string
    value: T
  }
}
