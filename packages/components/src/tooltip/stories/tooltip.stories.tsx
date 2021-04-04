import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Tooltip, TooltipProps } from '../index'
import '../style.css'

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {},
} as Meta

const Template: Story<TooltipProps> = (args) => (
  <Tooltip {...args}>
    <span>hello world</span>
  </Tooltip>
)

export const Default = Template.bind({})
Default.args = {
  content: 'This is tooltip message',
}
