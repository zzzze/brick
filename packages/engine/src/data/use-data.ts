import {DataObject} from "@/types"
import {Dispatch, SetStateAction, useEffect, useState} from "react"
import {DataConfig} from "./data-type"
import parseData from './parse-data'

export default (dataConfig: DataConfig, dataFromConfig: DataObject, pSupply: DataObject): [DataObject, Dispatch<SetStateAction<DataObject>>] => {
  const [data, setData] = useState(parseData(dataConfig, dataFromConfig, pSupply))
  useEffect(() => {
    const newData = parseData(dataConfig, dataFromConfig, pSupply)
    setData(newData)
  }, [dataConfig, pSupply])
  return [data, setData]
}
