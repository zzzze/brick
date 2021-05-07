import React from 'react'
import { Render } from './types'

interface RenderCopyProps {
  render: Render
}

const RenderCopy: React.FC<RenderCopyProps> = (props: RenderCopyProps) => {
  return props.render()
}

const CopyWrapper: React.FC<React.PropsWithChildren<unknown>> = (props) => {
  return <>{props.children}</>
}

export default RenderCopy
export { CopyWrapper }
