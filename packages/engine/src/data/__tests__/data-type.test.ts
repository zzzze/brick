import { StringType, NumberType, BooleanType } from '../data-type'
import normalizeDataType, { DataTypeDefinition } from '../normalize-data-type'

describe('normalizeDataType', () => {
  test('', () => {
    const registeredTypes = {
      [StringType.type]: StringType,
      [NumberType.type]: NumberType,
      [BooleanType.type]: BooleanType,
    }
    const dataType: Record<string, string | DataTypeDefinition> = {
      aa: 'string',
      bb: {
        type: 'number',
        default: 10,
      },
    }
    const result = normalizeDataType(registeredTypes, dataType)
    expect(result).toMatchObject({
      aa: {
        type: 'string',
        default: '',
      },
      bb: {
        type: 'number',
        default: 10,
      },
    })
  })
})
