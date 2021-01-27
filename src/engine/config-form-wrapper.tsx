import React from 'react'
import { Config, Brick, PropsObject } from '@/types'
import PropsForm from '@/engine/props-form'

interface ConfigFormWrapperProps {
  children: React.ReactNode
  config: Config
  bricks: Record<string, Brick>
  onChange: (newProps: PropsObject) => void
}

const ConfigFormWrapper: React.FC<ConfigFormWrapperProps> = ({
  children,
  config,
  bricks,
  onChange,
}: ConfigFormWrapperProps) => {
  return (
    <div>
      <PropsForm config={config} bricks={bricks} onChange={onChange} />
      {children}
    </div>
  )
}

export default ConfigFormWrapper
