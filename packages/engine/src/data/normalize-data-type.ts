import {DataType} from "./data-type";

export type DataTypeDefinition<T = unknown> = Omit<DataType<T>, 'isValid'>

function checkTypeIsString(dataType: string | DataTypeDefinition): dataType is string {
  return typeof dataType === 'string'
}

export default function normalizeDataType (registeredTypes: Record<string, DataType<unknown>>, dataTypes: Record<string, string | DataTypeDefinition>): Record<string, DataType> {
  return Object.keys(dataTypes).reduce<Record<string, DataType>>((result, key) => {
    const typeDefinition = dataTypes[key]
    if (checkTypeIsString(typeDefinition)) {
      if (!registeredTypes[typeDefinition]) {
        throw Error(`type "${typeDefinition}" not found`)
      }
      result[key] = {
        ...registeredTypes[typeDefinition],
      }
    } else {
      if (!registeredTypes[typeDefinition.type]) {
        throw Error(`type "${typeDefinition.type}" not found`)
      }
      result[key] = {
        ...registeredTypes[typeDefinition.type],
        ...typeDefinition,
      }
    }
    return result
  }, {})
}
