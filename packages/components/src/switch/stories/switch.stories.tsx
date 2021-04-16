import React, { useState, useCallback, useEffect } from 'react'
import { Story, Meta } from '@storybook/react'
import { SwitchProps, Switch } from '../index'
import { EventData } from '@brick/shared/types/form'

export default {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {},
} as Meta

const Template: Story<SwitchProps> = (args) => <Switch {...args} />

export const Default = Template.bind({})
Default.args = {
  value: true,
}

const Template2: Story<SwitchProps> = (args) => {
  const [value, setValue] = useState(args.value)
  useEffect(() => setValue(args.value), [args.value])
  const handleChange = useCallback(
    (event: EventData<unknown>) => {
      setValue(!!event.target.value)
      args.onChange && args.onChange(event)
    },
    [args.onChange]
  )
  return <Switch value={value} onChange={handleChange} />
}

export const AsFormItem = Template2.bind({})
Default.args = {
  value: true,
}
