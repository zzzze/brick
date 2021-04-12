import React, {useState} from 'react'
import { Story, Meta } from '@storybook/react'
import { Select, SelectProps } from '../index'
import './style.css'
import '../style.css'

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {},
} as Meta

const Template: Story<SelectProps<string>> = () => {
  const [value, setValue] = useState('world')
  return (
    <div className="container">
      <Select value={value} onChange={setValue}>
        <Select.Option value="hello">hello</Select.Option>
        <Select.Option value="world">world</Select.Option>
      </Select>
    </div>
  )
}

export const Default = Template.bind({})
