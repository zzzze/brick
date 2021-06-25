import React, { FC, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Brick } from './types'
import { BrickMenuItem } from './brick-menu-item'

interface BrickMenuProps {
  bricks: Brick[]
  containerRef?: React.RefObject<HTMLElement>
}

const BrickMenu: FC<BrickMenuProps> = (props: BrickMenuProps) => {
  const items = useMemo(() => {
    return props.bricks.map((item) => {
      return <BrickMenuItem key={item.name} brick={item} />
    })
  }, [props.bricks])
  if (!props.containerRef) {
    return <div style={{ display: 'flex', margin: 10 }}>{items}</div>
  }
  if (props.containerRef?.current) {
    return ReactDOM.createPortal(items, props.containerRef.current)
  }
  return null
}

export default BrickMenu
