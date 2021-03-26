import React, { RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import ConfigurationFormContext from './configuration-form-context'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import get from 'lodash/get'

interface EventData {
  target: {
    name: string
    value: Record<string, string>
  }
}

interface FormItemCommonProps {
  name: string
  label: string
  value?: unknown
  'data-testid'?: string
  ref?: RefObject<{ value: unknown }>
  onChange?: (data: EventData) => void
}

interface FormItemProps extends FormItemCommonProps {
  children: React.ReactElement<FormItemCommonProps>
}

const FormItem: React.FC<FormItemProps> = ({ label, name, children, ...props }: FormItemProps) => {
  const child = React.Children.only(children)
  const context = useContext(ConfigurationFormContext)
  const onChange = useCallback(
    (event: EventData) => {
      let newData = cloneDeep(context.data)
      newData = set(newData, event.target.name, event.target.value)
      context.onChange(newData)
    },
    [context.data]
  )
  const ref = useRef<{ value: unknown }>(null)
  useEffect(() => {
    if (context.autoCommit || !ref.current) {
      return
    }
    ref.current.value = get(context.data, name) || null
  }, [context.data, name])
  return (
    <div className="config-form__item">
      <label className="config-form__label" htmlFor="id">
        {label}
      </label>
      {context.autoCommit &&
        React.cloneElement(child, {
          name,
          value: get(context.data, name),
          onChange,
          ...props,
        })}
      {!context.autoCommit &&
        React.cloneElement(child, {
          name,
          ref,
          onChange,
          ...props,
        })}
    </div>
  )
}

export { ConfigurationFormContext }
export { FormItem as ConfigurationFormItem }
