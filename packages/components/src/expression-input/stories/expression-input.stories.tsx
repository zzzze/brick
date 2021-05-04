import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ExpressionInput, ExpressionInputProps } from '../index'
import '../style.css'

export default {
  title: 'Components/ExpressionInput',
  component: ExpressionInput,
  argTypes: {},
} as Meta

const Template: Story<ExpressionInputProps> = (args) => {
  return (
    <div className="container">
      <ExpressionInput {...args} />
    </div>
  )
}

export const OptionsChildren = Template.bind({})

OptionsChildren.args = {
  value: 'hello',
}
