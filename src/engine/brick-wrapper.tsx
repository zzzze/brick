import React, { Children, cloneElement } from 'react'
import { Config, Brick, PropsObject } from '@/types'
import ConfigForm from '@/engine/config-form'
import { BrickContainerProps } from './brick-containter'

interface ConfigFormWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
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
  const child: React.ReactElement<React.PropsWithChildren<unknown>> = Children.only(children)
  const propsForm = <ConfigForm config={config} bricks={bricks} onChange={onChange} />
  return cloneElement<BrickContainerProps>(
    child,
    {
      propsForm,
    },
    ...Children.toArray(child.props.children)
  )
}

export default ConfigFormWrapper
