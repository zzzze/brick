import React from 'react'
import { BrickInstance, Render } from './types'

interface RenderCopyProps {
  render: Render
  options: BrickInstance
}

const RenderCopy: React.FC<RenderCopyProps> = (props: RenderCopyProps) => {
  return props.render(props.options)
}

const CopyWrapper: React.FC<React.PropsWithChildren<unknown>> = (props) => {
  return <>{props.children}</>
}

export default RenderCopy
export { CopyWrapper }
