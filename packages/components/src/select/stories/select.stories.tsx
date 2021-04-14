import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Select, SelectProps } from '../index'
import './style.css'
import '../style.css'

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {},
} as Meta

const Template: Story<SelectProps<string>> = (args) => {
  return (
    <div className="container">
      <Select {...args}>
        <Select.Option value="hello">hello</Select.Option>
        <Select.Option value="world">world</Select.Option>
      </Select>
    </div>
  )
}

export const OptionsChildren = Template.bind({})

OptionsChildren.args = {
  value: 'hello',
}

export const OptionsProps = Template.bind({})

OptionsProps.args = {
  value: 'world ...',
  options: [
    {
      label: 'hello ...',
      value: 'hello ...',
    },
    {
      label: 'world ...',
      value: 'world ...',
    },
  ],
}
