import { Blueprint, Brick, BrickInstance, ChildrenType, Render, SetDataFn, SetDataOptions } from './types'

function copyBrick(bricks: Record<string, Brick>, blueprint: Blueprint, context: Partial<Brick>): Render {
  const brick = bricks[blueprint.name]
  if (!brick) {
    throw Error('brick not found')
  }
  const keyMap = Object.keys(brick.dataTypes).reduce<Record<string, string>>((acc, cur) => {
    const newKey = Math.random().toString(36).slice(2)
    if (!context.dataTypes) {
      context.dataTypes = {}
    }
    context.dataTypes[newKey] = brick.dataTypes[cur]
    acc[cur] = newKey
    return acc
  }, {})
  let childrenRenders: Render[] = []
  if (Array.isArray(blueprint.children) && blueprint.children.length) {
    childrenRenders = blueprint.children.map((item) => {
      return copyBrick(bricks, item, context)
    })
  }
  const render = (brickInstance: BrickInstance): React.ReactElement => {
    const data = Object.keys(keyMap).reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur] = brickInstance.data[keyMap[cur]]
      return acc
    }, {})
    const handleSetData = (fn: SetDataFn, options: SetDataOptions = {}): void => {
      let newData = fn({})
      newData = Object.keys(newData).reduce<Record<string, unknown>>((acc, cur) => {
        acc[keyMap[cur]] = newData[cur]
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
    return brick.render({
      ...brickInstance,
      data,
      setData: handleSetData,
    })
  }
  return render
}

const clusterBrick = (bricks: Record<string, Brick>, blueprint: Blueprint): Brick => {
  const context: Partial<Brick> = {}
  const render = copyBrick(bricks, blueprint, context)
  return {
    name: Math.random().toString(36).slice(2),
    dataTypes: {},
    childrenType: ChildrenType.NONE,
    render,
    version: '0.0.1',
    ...context,
  }
}

export default clusterBrick
