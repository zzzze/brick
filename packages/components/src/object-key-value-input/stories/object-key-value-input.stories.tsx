import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ObjectKeyValueInput, ObjectInputProps } from '../index'

export default {
  title: 'Components/ObjectKeyValueInput',
  component: ObjectKeyValueInput,
  argTypes: {},
} as Meta

const Template: Story<ObjectInputProps> = (args) => <ObjectKeyValueInput {...args} />

export const Default = Template.bind({})
Default.args = {
  value: {
    foo: 'bar',
  },
}
