import React, { cloneElement, CSSProperties, FC, useContext, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import { ITEM_TYPE } from './brick-wrapper'
import { Brick, BrickGroup, isBrickGroup } from './types'
import { nanoid } from 'nanoid'
import {compactBrick} from './cluster-brick'
import EnginxContext from './context'

const menuStyle: CSSProperties = {
  display: 'inline-block',
  marginRight: 10,
  border: 'solid 1px #ccc',
  borderRadius: 5,
  padding: '5px 10px',
  cursor: 'move',
}

interface BrickMenuItemProps {
  brick: Brick
}

const BrickMenuItem: FC<BrickMenuItemProps> = (props: BrickMenuItemProps) => {
  const engineCtx = useContext(EnginxContext)
  const data = useMemo(() => {
    let brick: Brick = props.brick
    if (isBrickGroup(props.brick)) {
      const context: Partial<BrickGroup> = {}
      const render = compactBrick(engineCtx.bricks, props.brick.map, context)
      brick = {
        ...props.brick,
        render,
        ...context,
      }
      engineCtx.bricks[props.brick.name] = brick
    }
    const data = Object.keys(brick.dataTypes).reduce<Record<string, unknown>>((acc, cur) => {
      const td = brick.dataTypes[cur]
      if (typeof td !== 'string') {
        acc[cur] = td.default
      }
      return acc
    }, {})
    return data
  }, [props.brick.name])
  const [, drag] = useDrag(
    {
      item: {
        type: ITEM_TYPE,
        blueprint: {
          _key: nanoid(),
          name: props.brick.name,
          data,
        },
      },
      begin() {
        return {
          type: ITEM_TYPE,
          blueprint: {
            _key: nanoid(),
            name: props.brick.name,
            data,
          },
        }
      },
      canDrag() {
        return true
      },
    },
    [props.brick.name, data]
  )
  if (props.brick.renderMenu) {
    return cloneElement(props.brick.renderMenu(), {
      ref: drag,
      style: menuStyle,
    })
  }
  return <div style={menuStyle} ref={drag}>{props.brick.name}</div>
}

export { BrickMenuItem }
