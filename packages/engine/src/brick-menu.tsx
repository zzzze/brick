import React, { FC, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Brick } from './types'
import { BrickMenuItem } from './brick-menu-item'

interface BrickMenuProps {
  bricks: Brick[]
  getContainer?: () => Element
}

const BrickMenu: FC<BrickMenuProps> = (props: BrickMenuProps) => {
  const container: Element | null = useMemo(() => {
    if (props.getContainer) {
      return props.getContainer()
    }
    return null
  }, [props.getContainer])
  const items = useMemo(() => {
    return props.bricks.map((item) => {
      return <BrickMenuItem key={item.name} brick={item} />
    })
  }, [props.bricks])
  if (container) {
    return ReactDOM.createPortal(items, container)
  }
  return <div style={{ display: 'flex' }}>{items}</div>
}

export default BrickMenu
