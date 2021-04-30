import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Tooltip, TooltipProps } from '../index'
import { JssProvider, ThemeProvider } from 'react-jss'
import { theme } from '@brick/shared'

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {},
} as Meta

const Template: Story<TooltipProps> = (args) => (
  <JssProvider>
    <ThemeProvider theme={theme.defaultTheme}>
      <Tooltip {...args}></Tooltip>
    </ThemeProvider>
  </JssProvider>
)

export const Default = Template.bind({})
Default.args = {
  content: 'This is tooltip message',
  children: <span>hello world</span>,
}

export const BlockChild = Template.bind({})
BlockChild.args = {
  content: 'This is tooltip message',
  children: (
    <div style={{ display: 'inline-block', width: 50 }}>
      <div>hello</div>
      <div>world</div>
    </div>
  ),
}
