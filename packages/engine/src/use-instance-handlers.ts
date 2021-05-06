import React, { useCallback, useMemo, useContext } from 'react'
import { Emit, SetBlueprint, SetData, SetDataFn, SetDataOptions } from './types'
import EnginxContext from './context'

export interface InstanceHandlers {
  setData: SetData
  emit: Emit
}

export default function useInstanceHandlers(
  data: Record<string, unknown>,
  setBlueprint: SetBlueprint,
  setData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
): InstanceHandlers {
  const context = useContext(EnginxContext)
  const handleSetData = useCallback(
    (fn: SetDataFn, options: SetDataOptions = {}): void => {
      const newData = fn(data)
      if (options.setToBlueprint) {
        setBlueprint((blueprint) => ({
          ...blueprint,
          data: newData,
        }))
      } else {
        setData(newData)
      }
      context.transactionCommit()
    },
    [data]
  )
  const handleEmit = useCallback((event: string, ...args: unknown[]) => {
    context.ee.emit(event, ...args)
  }, [])
  return useMemo(() => {
    return {
      setData: handleSetData,
      emit: handleEmit,
    }
  }, [handleSetData])
}
