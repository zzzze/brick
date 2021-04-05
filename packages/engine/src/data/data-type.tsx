import React, { ReactElement } from 'react'
import { ObjectKeyValueInput } from '@brick/components'
import isPlainObject from 'lodash/isPlainObject'

export interface TypeValidator {
  (value: unknown): boolean
}

export interface DataType<T = unknown> {
  type: string
  default: T
  label?: string
  placeholder?: string
  testID?: string
  tips?: ReactElement | string
  formItem: () => ReactElement
  isValid: TypeValidator
}

export type DataConfig = Record<string, DataType>

export const StringType: DataType<string> = {
  type: 'string',
  default: '',
  formItem: (placeholder?: string) => <input type="text" className="formitem-input" placeholder={placeholder} />,
  isValid: (value) => typeof value === 'string',
}

export const NumberType: DataType<number> = {
  type: 'number',
  default: 0,
  formItem: (placeholder?: string) => <input type="text" className="formitem-input" placeholder={placeholder} />,
  isValid: (value) => typeof value === 'number' && value == value,
}

export const BooleanType: DataType<boolean> = {
  type: 'boolean',
  default: false,
  formItem: (placeholder?: string) => <input type="text" className="formitem-input" placeholder={placeholder} />,
  isValid: (value) => typeof value === 'boolean',
}

export const ObjectType: DataType<Record<string, unknown>> = {
  type: 'object',
  default: {},
  formItem: () => <ObjectKeyValueInput className="formitem-textarea" />,
  isValid: (value) => isPlainObject(value),
}

export const CodeType: DataType<string> = {
  type: 'code',
  default: '',
  formItem: () => <textarea className="formitem-textarea" wrap="hard" />,
  isValid: (value) => typeof value === 'string',
}
