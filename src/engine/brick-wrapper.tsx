import React, { Children, cloneElement, useCallback, useContext } from 'react'
import { Config, Brick, PropsObject, SetConfig } from '@/types'
import PropsConfigForm from '@/engine/props-config-form'
import { BrickContainerProps } from '@/engine/brick-containter'
import CommonConfigForm from '@/engine/common-config-form'
import Context from '@/engine/context'

interface ConfigFormWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
  config: Config
  bricks: Record<string, Brick>
  onConfigChange: SetConfig
}

const ConfigFormWrapper: React.FC<ConfigFormWrapperProps> = ({
  children,
  config,
  bricks,
  onConfigChange,
}: ConfigFormWrapperProps) => {
  const context = useContext(Context)
  const handleChange = useCallback((newProps: PropsObject) => {
    onConfigChange((config: Config) => {
      return {
        ...config,
        props: newProps,
      }
    })
  }, [])
  const child: React.ReactElement<React.PropsWithChildren<unknown>> = Children.only(children)
  const configForm = context.renderConfigForm(
    <>
      <CommonConfigForm config={config} bricks={bricks} onConfigChange={onConfigChange} />
      <PropsConfigForm config={config} bricks={bricks} onPropsChange={handleChange} />
    </>
  )
  return cloneElement<BrickContainerProps>(
    child,
    {
      configForm,
    },
    ...Children.toArray(child.props.children)
  )
}

export default ConfigFormWrapper
