import React, { useCallback, useMemo, useContext } from 'react'
import { Emit, SetConfig, SetData, SetDataFn, SetDataOptions } from './types'
import Context from './context'

export interface HandlersUseInRender {
  setData: SetData
  emit: Emit
}

export default function useHandlersUseInRender(
  data: Record<string, unknown>,
  setConfig: SetConfig,
  setData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
): HandlersUseInRender {
  const context = useContext(Context)
  const handleSetData = useCallback(
    (fn: SetDataFn, options: SetDataOptions = {}): void => {
      const newData = fn(data)
      if (options.setToConfig) {
        setConfig((config) => ({
          ...config,
          data: newData,
        }))
      } else {
        setData(newData)
      }
    },
    [data]
  )
  const handleEmit = useCallback((event: string, ...args: unknown[]) => {
    context.ee.emit(event, ...args)
  }, [])
  return useMemo(
    () => ({
      setData: handleSetData,
      emit: handleEmit,
    }),
    [handleSetData]
  )
}
