import React from 'react'
import compileCustomRender from './compile-custom-render'
import { checkTypeIsString, DataTypeDefinition } from './data/normalize-data-type'
import {
  Blueprint,
  Brick,
  BrickGroup,
  BrickGroupMap,
  BrickInstance,
  ChildrenType,
  Render,
  SetDataFn,
  SetDataOptions,
} from './types'

function copyData(brick: Brick, bgm: BrickGroupMap, context: Partial<BrickGroup>): Record<string, string> {
  return Object.keys(brick.dataTypes).reduce<Record<string, string>>((acc, cur) => {
    const newKey = Math.random().toString(36).slice(2)
    if (!context.dataTypes) {
      context.dataTypes = {}
    }
    context.dataTypes[newKey] = embedData(brick.dataTypes[cur], bgm.data?.[cur])
    acc[cur] = newKey
    return acc
  }, {})
}

function embedData(td: DataTypeDefinition | string, value: unknown): DataTypeDefinition {
  if (!checkTypeIsString(td)) {
    td.default = value
    return td
  }
  return {
    type: td,
    default: value,
  }
}

function copyEvent(brick: Brick, context: Partial<Brick>) {
  if (!context.eventNames) {
    context.eventNames = []
    context.defaultHandlers = {}
  }
  brick.eventNames?.map((name) => {
    if (!context?.eventNames?.includes(name)) {
      context.eventNames?.push(name)
    }
  })
}

// 根据 BrickGroupMap 组合新的 brick
export function compactBrick(bricks: Record<string, Brick>, bgm: BrickGroupMap, context: Partial<BrickGroup>): Render {
  const brick = bricks[bgm.name]
  if (!brick) {
    throw Error('brick not found')
  }
  copyEvent(brick, context)
  const dataKeyMap = copyData(brick, bgm, context)
  let childrenRenders: Render[] = []
  if (Array.isArray(bgm.children) && bgm.children.length) {
    childrenRenders = bgm.children.map((item) => {
      return compactBrick(bricks, item, context)
    })
  }
  const render = (brickInstance: BrickInstance): React.ReactElement => {
    const data = Object.keys(dataKeyMap).reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur] = brickInstance.data[dataKeyMap[cur]]
      return acc
    }, {})
    const handleSetData = (fn: SetDataFn, options: SetDataOptions = {}): void => {
      let newData = fn({})
      newData = Object.keys(newData).reduce<Record<string, unknown>>((acc, cur) => {
        acc[dataKeyMap[cur]] = newData[cur]
        return acc
      }, {})
      brickInstance.setData((data) => {
        return {
          ...data,
          newData,
        }
      }, options)
    }
    brickInstance.children = childrenRenders.map((render) => render(brickInstance))
    let _render = brick.render
    if (bgm.render) {
      _render = compileCustomRender(bgm.render)
    }
    return _render({
      ...brickInstance,
      data,
      setData: handleSetData,
    })
  }
  return render
}

function constructBrickMap(blueprint: Blueprint): BrickGroupMap {
  const map: BrickGroupMap = {
    name: blueprint.name,
    data: blueprint.data,
    render: blueprint.render,
  }
  if (Array.isArray(blueprint.children)) {
    map.children = blueprint.children.map((child) => constructBrickMap(child))
  }
  return map
}

const clusterBrick = (blueprint: Blueprint): BrickGroup => {
  return {
    name: Math.random().toString(36).slice(2),
    map: constructBrickMap(blueprint),
    dataTypes: {},
    childrenType: ChildrenType.NONE,
    render: () => <></>,
    version: '0.0.1',
  }
}

export default clusterBrick
