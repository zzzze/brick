import { DataObject } from '@/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { DataConfig } from './data-type'
import parseData from './parse-data'
import { ContextType } from '../context'

export default (
  engineCtx: ContextType,
  dataConfig: DataConfig,
  dataFromConfig: DataObject,
  pSupply: DataObject,
  dataFromParent: DataObject
): [DataObject, Dispatch<SetStateAction<DataObject>>] => {
  const [data, setData] = useState(parseData(engineCtx, dataConfig, dataFromConfig, pSupply))
  useEffect(() => {
    const newData = parseData(engineCtx, dataConfig, dataFromConfig, pSupply)
    setData({
      ...newData,
      ...dataFromParent,
    })
  }, [dataConfig, pSupply])
  return [data, setData]
}
