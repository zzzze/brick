import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ObjectStringInput, ObjectInputProps } from '../index'

export default {
  title: 'Components/ObjectStringInput',
  component: ObjectStringInput,
  argTypes: {},
} as Meta

const Template: Story<ObjectInputProps> = (args) => <ObjectStringInput {...args} />

export const Default = Template.bind({})
Default.args = {
  value: {
    foo: 'bar',
  },
}
