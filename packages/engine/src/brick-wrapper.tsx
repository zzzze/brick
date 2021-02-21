import React, { Children, cloneElement, useCallback, useContext } from 'react'
import { Config, DataObject, EngineMode, SetConfig } from './types'
import PropsConfigForm from './props-config-form'
import { BrickContainerProps } from '@brick/components'
import CommonConfigForm from './common-config-form'
import Context from './context'
import clx from 'classnames'

interface BrickWrapperProps {
  children: React.ReactElement<React.PropsWithChildren<unknown>>
  config: Config
  onConfigChange: SetConfig
}

interface ChildProps {
  className?: string
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
  const child: React.ReactElement<React.PropsWithChildren<ChildProps>> = Children.only(children)
  const configForm = context.renderConfigForm(
    <CommonConfigForm config={config} onConfigChange={onConfigChange}>
      <PropsConfigForm config={config} onPropsChange={handleChange} />
    </CommonConfigForm>,
    context.ee
  )
  return cloneElement<BrickContainerProps>(
    child,
    {
      configForm: context.mode === EngineMode.EDIT ? configForm : null,
      className: clx(child.props.className, 'brick', {
        'brick__with-config-form': context.mode === EngineMode.EDIT,
      }),
    },
    ...Children.toArray(child.props.children)
  )
}

export default BrickWrapper
