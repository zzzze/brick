import React, { Children, cloneElement, useCallback, useContext } from 'react'
import { Config, DataObject, SetConfig } from './types'
import PropsConfigForm from './props-config-form'
import { BrickContainerProps } from '@brick/components'
import CommonConfigForm from './common-config-form'
import Context from './context'

interface BrickWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
  config: Config
  onConfigChange: SetConfig
}

const BrickWrapper: React.FC<BrickWrapperProps> = ({ children, config, onConfigChange }: BrickWrapperProps) => {
  const context = useContext(Context)
  const handleChange = useCallback((newProps: DataObject) => {
    onConfigChange((config: Config) => {
      return {
        ...config,
        data: newProps,
      }
    })
  }, [])
  const child: React.ReactElement<React.PropsWithChildren<unknown>> = Children.only(children)
  const configForm = context.renderConfigForm(
    <>
      <CommonConfigForm config={config} onConfigChange={onConfigChange} />
      <PropsConfigForm config={config} onPropsChange={handleChange} />
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

export default BrickWrapper
