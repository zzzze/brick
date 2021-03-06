import React, { RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import ConfigurationFormContext from './configuration-form-context'

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
  ref?: RefObject<{ value: unknown }>
  onChange?: (data: EventData) => void
}

interface FormItemProps extends FormItemCommonProps {
  children: React.ReactElement<FormItemCommonProps>
}

const FormItem: React.FC<FormItemProps> = ({ label, name, children }: FormItemProps) => {
  const child = React.Children.only(children)
  const context = useContext(ConfigurationFormContext)
  const onChange = useCallback(
    (event: EventData) => {
      context.onChange({
        ...context.data,
        [event.target.name]: event.target.value,
      })
    },
    [context.data]
  )
  const ref = useRef<{ value: unknown }>(null)
  useEffect(() => {
    if (context.autoCommit || !ref.current) {
      return
    }
    ref.current.value = context.data[name]
  }, [context.data[name]])
  return (
    <div className="config-form__item">
      <label className="config-form__label" htmlFor="id">
        {label}
      </label>
      {context.autoCommit &&
        React.cloneElement(child, {
          name,
          value: context.data[name],
          onChange,
        })}
      {!context.autoCommit &&
        React.cloneElement(child, {
          name,
          ref,
          onChange,
        })}
    </div>
  )
}

export { ConfigurationFormContext }
export { FormItem as ConfigurationFormItem }
