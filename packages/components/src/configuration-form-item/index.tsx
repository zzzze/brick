import React, { useCallback, useContext } from 'react'
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
  onChange?: (data: EventData) => void
}

interface FormItemProps extends FormItemCommonProps {
  children: React.ReactElement<FormItemCommonProps>
}

const FormItem: React.FC<FormItemProps> = ({ label, name, children }: FormItemProps) => {
  const child: React.ReactElement<FormItemCommonProps> = React.Children.only(children)
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
  return (
    <div className="config-form__item">
      <label className="config-form__label" htmlFor="id">
        {label}
      </label>
      {React.cloneElement(child, {
        name,
        value: context.data[name],
        onChange,
      })}
    </div>
  )
}

export { ConfigurationFormContext }
export { FormItem as ConfigurationFormItem }
