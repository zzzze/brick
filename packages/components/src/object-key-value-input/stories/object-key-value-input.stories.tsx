import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ObjectKeyValueInput } from '../index'
import { ObjectInputProps } from '../../object-input-props'
import '../../select/style.css'
import './style.css'

export default {
  title: 'Components/ObjectKeyValueInput',
  component: ObjectKeyValueInput,
  argTypes: {},
} as Meta

const Template: Story<ObjectInputProps> = (args) => (
  <div className="container">
    <ObjectKeyValueInput {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  value: {
    foo: 'bar',
  },
}
