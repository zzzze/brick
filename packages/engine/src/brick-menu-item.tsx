import React, { cloneElement, FC } from 'react'
import { useDrag } from 'react-dnd'
import { ITEM_TYPE } from './brick-wrapper'
import { Brick } from './types'
import { nanoid } from 'nanoid'

interface BrickMenuItemProps {
  brick: Brick
}

const BrickMenuItem: FC<BrickMenuItemProps> = (props: BrickMenuItemProps) => {
  const [, drag] = useDrag(
    {
      item: {
        type: ITEM_TYPE,
        blueprint: {
          _key: nanoid(),
          name: props.brick.name,
        },
      },
      canDrag() {
        return true
      },
    },
    [props]
  )
  if (props.brick.renderMenu) {
    return cloneElement(props.brick.renderMenu(), {
      ref: drag,
    })
  }
  return <div ref={drag}>{props.brick.name}</div>
}

export { BrickMenuItem }
