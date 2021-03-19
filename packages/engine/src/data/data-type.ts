export interface TypeValidator {
  (value: unknown): boolean
}

export interface DataType<T = unknown> {
  type: string
  default: T
  isValid: TypeValidator
}

export type DataConfig = Record<string, DataType>

export const StringType: DataType<string> = {
  type: 'string',
  default: '',
  isValid: (value) => typeof value === 'string',
}

export const NumberType: DataType<number> = {
  type: 'number',
  default: 0,
  isValid: (value) => typeof value === 'number' && value == value,
}

export const BooleanType: DataType<boolean> = {
  type: 'boolean',
  default: false,
  isValid: (value) => typeof value === 'boolean',
}
