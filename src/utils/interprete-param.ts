import { VALUE_PARAM_PATTERN } from '@/types'
import { get as _get } from 'lodash'

export const interpreteParam = (param: string, obj: Record<string, unknown>): unknown => {
  let value: unknown = param
  const match = VALUE_PARAM_PATTERN.exec(param)
  if (match) {
    const path = match[1]
    value = _get(obj, path)
  }
  return value
}
